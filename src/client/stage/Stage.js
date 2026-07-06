import ChannelAudioSlotConnectionState from '../../constants/ChannelAudioConnectionState.js';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import path from 'path';
import Stream from 'node:stream';
import { Worker } from 'node:worker_threads';
import wrtc from '@roamhq/wrtc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { nonstandard, MediaStream, RTCSessionDescription, RTCPeerConnection } = wrtc;

const AUDIO_CONFIG = {
  SAMPLE_RATE: 48000,
  CHANNEL_COUNT: 2,
  BITRATE: 16,
  FRAMES: 480,
  MIN_PRELOAD_FRAMES: 3,
  MAX_DRIFT_MS: 5,
  FRAME_DURATION_MS: 10,
  SDP_CREATION_TIMEOUT_MS: 10000,
  WORKER_TERMINATION_TIMEOUT_MS: 5000,
  FFMPEG_GRACEFUL_SHUTDOWN_MS: 3000,
  MAX_BUFFER_QUEUE_SIZE: 100,
  MIN_VOLUME: 0,
  MAX_VOLUME: 2
};

const BROADCAST_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused'
};

const CLIENT_STATES = {
  ENABLED: 'enabled',
  DISABLED: 'disabled'
};

// Error codes in one place so callers can import and switch on them
export const AUDIO_ERROR_CODES = Object.freeze({
  INVALID_CLIENT: 'INVALID_CLIENT',
  INVALID_CHANNEL_ID: 'INVALID_CHANNEL_ID',
  CLIENT_DESTROYED: 'CLIENT_DESTROYED',
  INVALID_AUDIO_DATA: 'INVALID_AUDIO_DATA',
  INVALID_BUFFER: 'INVALID_BUFFER',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  INVALID_STATE: 'INVALID_STATE',
  WEBRTC_INIT_FAILED: 'WEBRTC_INIT_FAILED',
  WORKER_INIT_FAILED: 'WORKER_INIT_FAILED',
  WORKER_THREAD_ERROR: 'WORKER_THREAD_ERROR',
  WORKER_EXIT_ERROR: 'WORKER_EXIT_ERROR',
  WORKER_ERROR: 'WORKER_ERROR',
  BUFFER_PROCESSING_ERROR: 'BUFFER_PROCESSING_ERROR',
  FFMPEG_ERROR: 'FFMPEG_ERROR',
  CONNECTION_FAILED: 'CONNECTION_FAILED'
});

export class AudioClientError extends Error {
  constructor (message, code, originalError = null) {
    super(message);
    this.name = 'AudioClientError';
    this.code = code;
    this.originalError = originalError;
    // Preserve original stack when wrapping
    if (originalError?.stack) {
      this.stack += `\nCaused by: ${originalError.stack}`;
    }
  }
}

// Pre-compute frame size so it isn't recalculated in the hot processBuffer path
const FRAME_SAMPLE_COUNT = AUDIO_CONFIG.FRAMES * AUDIO_CONFIG.CHANNEL_COUNT;

export default class Stage {
  // ---------------- PRIVATE FIELDS ----------------
  #audioSource;
  #broadcastState = BROADCAST_STATES.IDLE;
  #channelId;
  #cleanupTasks = new Set();
  #client;
  #destroyed = false;
  #ffmpeg = null;
  #leftoverSamples;
  #mediaStream;
  #numLeftoverSamples = 0;
  #paused = false;
  #peerConnection;
  #settings;
  #slotId;
  #state = CLIENT_STATES.DISABLED;
  #track;
  #underrunCount = 0;
  #worker;

  // ---------------- CONSTRUCTOR ----------------
  constructor (client, channelId, settings = { volume: 1, muted: false }) {
    if (!client) { throw new AudioClientError('Client is required', AUDIO_ERROR_CODES.INVALID_CLIENT); }
    if (!channelId) { throw new AudioClientError('Channel ID is required', AUDIO_ERROR_CODES.INVALID_CHANNEL_ID); }

    this.#channelId = channelId;
    this.#client = client;
    this.#settings = this.#validateSettings(settings);
    this.#slotId = undefined;
    this.connectionState = ChannelAudioSlotConnectionState.DISCONNECTED;
    this.#leftoverSamples = new Int16Array(FRAME_SAMPLE_COUNT);

    this.#initializeWebRTC();
    this.#initializeWorker();
    this.#setupCleanupTasks();
  }

  // ---------------- PRIVATE HELPERS ----------------

  /** Throws if the instance has been destroyed. */
  #assertAlive (operation) {
    if (this.#destroyed) {
      throw new AudioClientError(
        `Cannot ${operation} on a destroyed client`,
        AUDIO_ERROR_CODES.CLIENT_DESTROYED
      );
    }
  }

  #validateSettings (settings) {
    const validated = { ...settings };
    if (
      typeof validated.volume !== 'number' ||
      validated.volume < AUDIO_CONFIG.MIN_VOLUME ||
      validated.volume > AUDIO_CONFIG.MAX_VOLUME
    ) {
      validated.volume = 1;
    }
    if (typeof validated.muted !== 'boolean') { validated.muted = false; }
    return validated;
  }

  // ---------------- PRIVATE: WebRTC ----------------

  #initializeWebRTC () {
    try {
      this.#peerConnection = new RTCPeerConnection();
      this.#audioSource = new nonstandard.RTCAudioSource();
      this.#track = this.#audioSource.createTrack();
      this.#mediaStream = new MediaStream([this.#track]);
      this.#peerConnection.addTrack(this.#track, this.#mediaStream);
      this.#peerConnection.onconnectionstatechange = this.#handleConnectionStateChange;
    } catch (error) {
      throw new AudioClientError('Failed to initialize WebRTC', AUDIO_ERROR_CODES.WEBRTC_INIT_FAILED, error);
    }
  }

  #handleConnectionStateChange = () => {
    if (this.#destroyed) { return; }

    const state = this.#peerConnection.connectionState;

    switch (state) {
      case 'connecting':
        this.connectionState = ChannelAudioSlotConnectionState.PENDING;
        this.#client.emit('channelAudioClientConnecting', this);
        break;

      case 'connected':
        // Emit 'ready' when we reconnect to an already-connected slot;
        // emit 'connected' for the initial handshake.
        if (this.connectionState === ChannelAudioSlotConnectionState.CONNECTED) {
          this.#client.emit('channelAudioClientReady', this);
        } else {
          this.connectionState = ChannelAudioSlotConnectionState.CONNECTED;
          this.#client.emit('channelAudioClientConnected', this);
        }
        break;

      case 'disconnected':
        this.connectionState = ChannelAudioSlotConnectionState.DISCONNECTED;
        this.#client.emit('channelAudioClientDisconnected', this);
        break;

      case 'failed':
        this.connectionState = ChannelAudioSlotConnectionState.DISCONNECTED;
        this.#client.emit('channelAudioClientError', new AudioClientError(
          'WebRTC connection failed', AUDIO_ERROR_CODES.CONNECTION_FAILED
        ));
        break;
    }
  };

  // ---------------- PRIVATE: Worker ----------------

  #initializeWorker () {
    try {
      const workerPath = path.join(__dirname, 'StageWorker.js');
      this.#worker = new Worker(workerPath);

      this.#worker.on('message', this.#handleWorkerMessage);
      this.#worker.on('error', this.#handleWorkerError);
      this.#worker.on('exit', this.#handleWorkerExit);

      this.#worker.postMessage({
        type: 'init',
        config: {
          frameDurationMs: AUDIO_CONFIG.FRAME_DURATION_MS,
          sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
          channelCount: AUDIO_CONFIG.CHANNEL_COUNT,
          frames: AUDIO_CONFIG.FRAMES,
          maxQueueSize: AUDIO_CONFIG.MAX_BUFFER_QUEUE_SIZE
        }
      });
    } catch (error) {
      throw new AudioClientError('Failed to initialize worker', AUDIO_ERROR_CODES.WORKER_INIT_FAILED, error);
    }
  }

  #handleWorkerError = (error) => {
    this.#client.emit('channelAudioClientError', new AudioClientError(
      'Worker thread error', AUDIO_ERROR_CODES.WORKER_THREAD_ERROR, error
    ));
  };

  #handleWorkerExit = (code) => {
    if (!this.#destroyed && code !== 0) {
      this.#client.emit('channelAudioClientError', new AudioClientError(
        `Worker exited unexpectedly with code ${code}`, AUDIO_ERROR_CODES.WORKER_EXIT_ERROR
      ));
    }
  };

  #handleWorkerMessage = (message) => {
    if (this.#destroyed) { return; }
    switch (message.type) {
      case 'underrun':
        this.#underrunCount = message.count;
        break;
      case 'audioFrame':
        if (message.data && this.#audioSource) { this.#audioSource.onData(message.data); }
        break;
      case 'error':
        this.#client.emit('channelAudioClientError', new AudioClientError(
          'Worker processing error', AUDIO_ERROR_CODES.WORKER_ERROR, message.error
        ));
        break;
    }
  };

  // ---------------- PRIVATE: FFmpeg ----------------

  /**
   * Kills the active FFmpeg process if one exists.
   * Uses SIGKILL directly — consider SIGTERM + timeout for graceful drain
   * if the stream format needs a proper trailer (e.g. MP4).
   */
  async #stopFFmpeg () {
    if (!this.#ffmpeg) { return; }
    this.#ffmpeg.kill('SIGKILL');
    this.#ffmpeg = null;
  }

  // ---------------- PRIVATE: Cleanup ----------------

  #setupCleanupTasks () {
    const cleanup = () => this.destroy().catch(console.error);
    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);
    process.once('exit', cleanup);

    this.#cleanupTasks.add(() => {
      process.removeListener('SIGINT', cleanup);
      process.removeListener('SIGTERM', cleanup);
      process.removeListener('exit', cleanup);
    });
  }

  // ---------------- PUBLIC: Getters / Setters ----------------

  get broadcastState () { return this.#broadcastState; }

  set broadcastState (value) {
    if (!Object.values(BROADCAST_STATES).includes(value)) {
      throw new AudioClientError(`Invalid broadcast state: ${value}`, AUDIO_ERROR_CODES.INVALID_STATE);
    }
    this.#broadcastState = value;
    this.#state = value === BROADCAST_STATES.PLAYING
      ? CLIENT_STATES.ENABLED
      : CLIENT_STATES.DISABLED;
  }

  get slotId () { return this.#slotId; }
  get underrunCount () { return this.#underrunCount; }

  // ---------------- PUBLIC: Settings ----------------

  updateSettings (settings) {
    this.#assertAlive('update settings');
    const newSettings = this.#validateSettings(settings);

    if (newSettings.muted !== this.#settings.muted) {
      this.#client.emit(
        newSettings.muted
          ? 'channelAudioClientBroadcastMuted'
          : 'channelAudioClientBroadcastUnmuted',
        this.#channelId
      );
    }

    this.#settings = newSettings;

    this.#worker?.postMessage({
      type: 'updateSettings',
      settings: { volume: this.#settings.volume, muted: this.#settings.muted }
    });
  }

  // ---------------- PUBLIC: Audio pipeline ----------------

  enqueue (item) {
    this.#assertAlive('enqueue');
    if (!item?.samples || !(item.samples instanceof Int16Array)) {
      throw new AudioClientError('Invalid audio data', AUDIO_ERROR_CODES.INVALID_AUDIO_DATA);
    }
    this.#worker.postMessage({ type: 'enqueue', data: item });
  }

  /**
   * Accepts a raw PCM buffer, slices it into fixed-size frames (accounting for
   * leftover samples from the previous call), and enqueues each complete frame.
   */
  async processBuffer (buffer) {
    this.#assertAlive('process buffer');
    if (!buffer || !(buffer.buffer instanceof ArrayBuffer)) {
      throw new AudioClientError('Expected an ArrayBuffer', AUDIO_ERROR_CODES.INVALID_BUFFER);
    }

    try {
      const samples = new Int16Array(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength / Int16Array.BYTES_PER_ELEMENT
      );
      let chunkStart = 0;

      while (chunkStart < samples.length && !this.#destroyed) {
        const wantedSamples = FRAME_SAMPLE_COUNT - this.#numLeftoverSamples;
        const remainingSamples = samples.length - chunkStart;

        // Not enough samples to fill a frame — stash the remainder
        if (remainingSamples < wantedSamples) {
          const copyLength = Math.min(
            remainingSamples,
            this.#leftoverSamples.length - this.#numLeftoverSamples
          );
          if (copyLength > 0) {
            this.#leftoverSamples.set(
              samples.subarray(chunkStart, chunkStart + copyLength),
              this.#numLeftoverSamples
            );
            this.#numLeftoverSamples += copyLength;
          }
          break;
        }

        // We have a full frame's worth of samples
        let chunk = samples.subarray(chunkStart, chunkStart + wantedSamples);
        if (this.#numLeftoverSamples > 0) {
          // Prepend leftover samples from the previous call
          this.#leftoverSamples.set(chunk, this.#numLeftoverSamples);
          chunk = new Int16Array(this.#leftoverSamples.buffer, 0, FRAME_SAMPLE_COUNT);
          this.#numLeftoverSamples = 0;
        }

        this.enqueue({
          samples: chunk,
          sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
          bitsPerSample: AUDIO_CONFIG.BITRATE,
          channelCount: AUDIO_CONFIG.CHANNEL_COUNT,
          numberOfFrames: AUDIO_CONFIG.FRAMES,
          timestamp: performance.now()
        });

        chunkStart += wantedSamples;
      }
    } catch (error) {
      // Re-throw AudioClientErrors as-is; wrap everything else
      if (error instanceof AudioClientError) { throw error; }
      throw new AudioClientError('Buffer processing failed', AUDIO_ERROR_CODES.BUFFER_PROCESSING_ERROR, error);
    }
  }

  // ---------------- PUBLIC: WebRTC signalling ----------------

  async createSDP () {
    this.#assertAlive('create SDP');
    const offer = await this.#peerConnection.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });
    await this.#peerConnection.setLocalDescription(offer);
    return this.#peerConnection.localDescription?.sdp;
  }

  async setResponse (slotId, sdp) {
    this.#assertAlive('set response');
    if (!slotId || !sdp) {
      throw new AudioClientError('Slot ID and SDP are required', AUDIO_ERROR_CODES.INVALID_PARAMETERS);
    }
    this.#slotId = slotId;
    await this.#peerConnection.setRemoteDescription(
      new RTCSessionDescription({ type: 'answer', sdp })
    );
  }

  // ---------------- PUBLIC: Playback controls ----------------

  async play (data) {
    this.#assertAlive('play');
    if (!data) { throw new AudioClientError('Audio data is required', AUDIO_ERROR_CODES.INVALID_AUDIO_DATA); }

    // Stop any active FFmpeg process before starting a new one
    await this.#stopFFmpeg();

    let streamClosed = false;
    this.#ffmpeg = ffmpeg();

    this.#ffmpeg
      .input(data)
      .toFormat('wav')
      .on('error', (error) => {
        if (data instanceof Stream) { data.destroy(); }
        if (!streamClosed) {
          streamClosed = true;
          // Emit rather than throw — FFmpeg errors arrive in an event callback,
          // not in a Promise chain, so throwing here is swallowed by Node's event emitter.
          this.#client.emit('channelAudioClientError',
            new AudioClientError('FFmpeg processing error', AUDIO_ERROR_CODES.FFMPEG_ERROR, error)
          );
        }
      })
      .pipe()
      .on('close', () => { streamClosed = true; })
      .on('pipe', () => {
        this.broadcastState = BROADCAST_STATES.PLAYING;
        this.#client.emit('channelAudioClientBroadcastStarted', this.#channelId);
      })
      .on('data', (buffer) => {
        if (!streamClosed && !this.#destroyed) { this.processBuffer(buffer); }
      })
      .on('finish', () => {
        this.broadcastState = BROADCAST_STATES.IDLE;
        this.#client.emit('channelAudioClientBroadcastFinished', this.#channelId);
        streamClosed = true;
      });
  }

  async stop () {
    this.#assertAlive('stop');
    await this.#stopFFmpeg();
    this.broadcastState = BROADCAST_STATES.IDLE;
    this.#client.emit('channelAudioClientBroadcastStopped', this.#channelId);
  }

  async pause () {
    this.#assertAlive('pause');
    this.broadcastState = BROADCAST_STATES.PAUSED;
    this.#paused = true;
    this.#client.emit('channelAudioClientBroadcastPaused', this.#channelId);
    this.#worker?.postMessage({ type: 'pause' });
  }

  async resume () {
    this.#assertAlive('resume');
    // If FFmpeg is still active, we were in the middle of a stream — go back to PLAYING.
    // Otherwise the stream finished while paused — reset to IDLE.
    this.broadcastState = this.#ffmpeg
      ? BROADCAST_STATES.PLAYING
      : BROADCAST_STATES.IDLE;
    this.#paused = false;
    this.#client.emit('channelAudioClientBroadcastResumed', this.#channelId);
    this.#worker?.postMessage({ type: 'resume' });
  }

  // ---------------- PUBLIC: Lifecycle ----------------

  async destroy () {
    if (this.#destroyed) { return; }
    this.#destroyed = true;

    await this.#stopFFmpeg();

    if (this.#worker) {
      this.#worker.postMessage({ type: 'shutdown' });
      await this.#worker.terminate();
    }

    if (this.#peerConnection?.connectionState !== 'closed') {
      this.#peerConnection?.close();
    }

    for (const task of this.#cleanupTasks) { task(); }
    this.#cleanupTasks.clear();

    // Null out all resource references so GC can collect them
    this.#audioSource = null;
    this.#track = null;
    this.#mediaStream = null;
    this.#peerConnection = null;
    this.#worker = null;
    this.#leftoverSamples = null;
  }
}
