import ChannelAudioSlotConnectionState from '../../constants/ChannelAudioConnectionState.js';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import path from 'path';
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

class AudioClientError extends Error {
  constructor (message, code, originalError = null) {
    super(message);
    this.name = 'AudioClientError';
    this.code = code;
    this.originalError = originalError;
  }
}

export default class Stage {
  // ---------------- PRIVATE FIELDS ----------------
  #client;
  #channelId;
  #slotId;
  #broadcastState;
  #state;
  #settings;
  #peerConnection;
  #audioSource;
  #track;
  #mediaStream;
  #worker;
  #ffmpeg;
  #paused = false;
  #destroyed = false;
  #leftoverSamples;
  #numLeftoverSamples = 0;
  #underrunCount = 0;
  #cleanupTasks = new Set();

  // ---------------- CONSTRUCTOR ----------------
  constructor (client, channelId, settings = { volume: 1, muted: false }) {
    if (!client) { throw new AudioClientError('Client is required', 'INVALID_CLIENT'); }
    if (!channelId) { throw new AudioClientError('Channel ID is required', 'INVALID_CHANNEL_ID'); }

    this.#client = client;
    this.#channelId = channelId;
    this.#slotId = undefined;

    this.#settings = this.#validateSettings(settings);
    this.#broadcastState = BROADCAST_STATES.IDLE;
    this.connectionState = ChannelAudioSlotConnectionState.DISCONNECTED;
    this.#state = CLIENT_STATES.DISABLED;

    this.#leftoverSamples = new Int16Array(AUDIO_CONFIG.FRAMES * AUDIO_CONFIG.CHANNEL_COUNT);

    this.#initializeWebRTC();
    this.#initializeWorker();
    this.#setupCleanupTasks();
  }

  // ---------------- PRIVATE METHODS ----------------
  #validateSettings = (settings) => {
    const validated = { ...settings };
    if (typeof validated.volume !== 'number' ||
        validated.volume < AUDIO_CONFIG.MIN_VOLUME ||
        validated.volume > AUDIO_CONFIG.MAX_VOLUME) { validated.volume = 1; }
    if (typeof validated.muted !== 'boolean') { validated.muted = false; }
    return validated;
  };

  #initializeWebRTC = () => {
    try {
      this.#peerConnection = new RTCPeerConnection();
      this.#audioSource = new nonstandard.RTCAudioSource();
      this.#track = this.#audioSource.createTrack();
      this.#mediaStream = new MediaStream([this.#track]);
      this.#peerConnection.addTrack(this.#track, this.#mediaStream);

      this.#peerConnection.onconnectionstatechange = this.#handleConnectionStateChange;
    } catch (error) {
      throw new AudioClientError('Failed to initialize WebRTC', 'WEBRTC_INIT_FAILED', error);
    }
  };

  #initializeWorker = () => {
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
      throw new AudioClientError('Failed to initialize worker', 'WORKER_INIT_FAILED', error);
    }
  };

  #setupCleanupTasks = () => {
    const cleanup = () => this.destroy().catch(console.error);
    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);
    process.once('exit', cleanup);

    this.#cleanupTasks.add(() => {
      process.removeListener('SIGINT', cleanup);
      process.removeListener('SIGTERM', cleanup);
      process.removeListener('exit', cleanup);
    });
  };

  #handleConnectionStateChange = () => {
    if (this.#destroyed) { return; }

    const state = this.#peerConnection.connectionState;

    switch (state) {
      case 'connecting':
        this.connectionState = ChannelAudioSlotConnectionState.PENDING;
        this.#client.emit('channelAudioClientConnecting', this);
        break;

      case 'connected':
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
          'WebRTC connection failed', 'CONNECTION_FAILED'
        ));
        break;
    }
  };

  #handleWorkerMessage = (message) => {
    if (this.#destroyed) { return; }
    switch (message.type) {
      case 'underrun': this.#underrunCount = message.count; break;
      case 'audioFrame':
        if (message.data && this.#audioSource) { this.#audioSource.onData(message.data); }
        break;
      case 'error':
        this.#client.emit('channelAudioClientError', new AudioClientError(
          'Worker processing error', 'WORKER_ERROR', message.error
        ));
        break;
    }
  };

  #handleWorkerError = (error) => {
    this.#client.emit('channelAudioClientError', new AudioClientError(
      'Worker thread error', 'WORKER_THREAD_ERROR', error
    ));
  };

  #handleWorkerExit = (code) => {
    if (!this.#destroyed && code !== 0) {
      this.#client.emit('channelAudioClientError', new AudioClientError(
        `Worker exited unexpectedly with code ${code}`, 'WORKER_EXIT_ERROR'
      ));
    }
  };

  #stopFFmpeg = async () => {
    if (!this.#ffmpeg) { return; }
    this.#ffmpeg.kill('SIGKILL');
  };

  // ---------------- PUBLIC API ----------------
  get broadcastState () { return this.#broadcastState; }
  set broadcastState (value) {
    if (!Object.values(BROADCAST_STATES).includes(value)) {
      throw new AudioClientError(`Invalid broadcast state: ${value}`, 'INVALID_STATE');
    }
    this.#broadcastState = value;
    this.#state = value === BROADCAST_STATES.PLAYING
      ? CLIENT_STATES.ENABLED
      : CLIENT_STATES.DISABLED;
  }

  updateSettings (settings) {
    if (this.#destroyed) { throw new AudioClientError('Cannot update settings on destroyed client', 'CLIENT_DESTROYED'); }
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

    if (this.#worker) {
      this.#worker.postMessage({
        type: 'updateSettings',
        settings: {
          volume: this.#settings.volume,
          muted: this.#settings.muted
        }
      });
    }
  }

  enqueue (item) {
    if (this.#destroyed) { throw new AudioClientError('Cannot enqueue on destroyed client', 'CLIENT_DESTROYED'); }
    if (!item?.samples || !(item.samples instanceof Int16Array)) { throw new AudioClientError('Invalid audio data', 'INVALID_AUDIO_DATA'); }
    this.#worker.postMessage({ type: 'enqueue', data: item });
  }

  async processBuffer (buffer) {
    if (this.#destroyed) { throw new AudioClientError('Cannot process buffer on destroyed client', 'CLIENT_DESTROYED'); }
    if (!buffer || !(buffer.buffer instanceof ArrayBuffer)) { throw new AudioClientError('Expected an ArrayBuffer', 'INVALID_BUFFER'); }

    try {
      const samples = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Int16Array.BYTES_PER_ELEMENT);
      let chunkStart = 0;

      while (chunkStart < samples.length && !this.#destroyed) {
        const wantedSamples = AUDIO_CONFIG.FRAMES * AUDIO_CONFIG.CHANNEL_COUNT - this.#numLeftoverSamples;
        const remainingSamples = samples.length - chunkStart;

        if (remainingSamples < wantedSamples) {
          const copyLength = Math.min(remainingSamples, this.#leftoverSamples.length - this.#numLeftoverSamples);
          if (copyLength > 0) {
            this.#leftoverSamples.set(samples.slice(chunkStart, chunkStart + copyLength), this.#numLeftoverSamples);
            this.#numLeftoverSamples += copyLength;
          }
          break;
        }

        let chunk = samples.slice(chunkStart, chunkStart + wantedSamples);
        if (this.#numLeftoverSamples > 0) {
          this.#leftoverSamples.set(chunk, this.#numLeftoverSamples);
          chunk = new Int16Array(this.#leftoverSamples.buffer, 0, AUDIO_CONFIG.FRAMES * AUDIO_CONFIG.CHANNEL_COUNT);
          this.#numLeftoverSamples = 0;
        }

        const frameData = {
          samples: chunk,
          sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
          bitsPerSample: AUDIO_CONFIG.BITRATE,
          channelCount: AUDIO_CONFIG.CHANNEL_COUNT,
          numberOfFrames: AUDIO_CONFIG.FRAMES,
          timestamp: performance.now()
        };

        this.enqueue(frameData);
        chunkStart += wantedSamples;
      }
    } catch (error) {
      throw new AudioClientError('Buffer processing failed', 'BUFFER_PROCESSING_ERROR', error);
    }
  }

  async createSDP () {
    if (this.#destroyed) { throw new AudioClientError('Cannot create SDP on destroyed client', 'CLIENT_DESTROYED'); }

    const sdpPromise = this.#peerConnection.createOffer({ offerToReceiveAudio: false, offerToReceiveVideo: false })
      .then(offer => this.#peerConnection.setLocalDescription(offer).then(() => this.#peerConnection.localDescription?.sdp));

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new AudioClientError('SDP creation timeout', 'SDP_TIMEOUT')), AUDIO_CONFIG.SDP_CREATION_TIMEOUT_MS);
    });

    return Promise.race([sdpPromise, timeoutPromise]);
  }

  async setResponse (slotId, sdp) {
    if (this.#destroyed) { throw new AudioClientError('Cannot set response on destroyed client', 'CLIENT_DESTROYED'); }
    if (!slotId || !sdp) { throw new AudioClientError('Slot ID and SDP are required', 'INVALID_PARAMETERS'); }

    this.#slotId = slotId;
    const description = new RTCSessionDescription({ type: 'answer', sdp });
    await this.#peerConnection.setRemoteDescription(description);
  }

  async play (data) {
    if (this.#destroyed) { throw new AudioClientError('Cannot play on destroyed client', 'CLIENT_DESTROYED'); }
    if (!data) { throw new AudioClientError('Audio data is required', 'INVALID_AUDIO_DATA'); }

    let closed = false;
    await this.#stopFFmpeg();
    this.#ffmpeg = ffmpeg();

    this.#ffmpeg
      .input(data)
      .toFormat('wav')
      .on('error', (error) => {
        if (data instanceof Stream) { data?.destroy(); }
        if (!closed) { closed = true; throw new AudioClientError('FFmpeg processing error', 'FFMPEG_ERROR', error); }
      })
      .pipe()
      .on('close', () => { closed = true; })
      .on('pipe', () => {
        this.broadcastState = BROADCAST_STATES.PLAYING;
        this.#client.emit('channelAudioClientBroadcastStarted', this.#channelId);
      })
      .on('data', (buffer) => {
        if (!closed && !this.#destroyed) { this.processBuffer(buffer); }
      })
      .on('finish', () => {
        this.broadcastState = BROADCAST_STATES.IDLE;
        this.#client.emit('channelAudioClientBroadcastFinished', this.#channelId);
        closed = true;
      });
  }

  async stop () {
    if (this.#destroyed) { throw new AudioClientError('Cannot stop destroyed client', 'CLIENT_DESTROYED'); }
    await this.#stopFFmpeg();
    this.broadcastState = BROADCAST_STATES.IDLE;
    this.#client.emit('channelAudioClientBroadcastStopped', this.#channelId);
  }

  async pause () {
    if (this.#destroyed) { throw new AudioClientError('Cannot pause destroyed client', 'CLIENT_DESTROYED'); }
    this.broadcastState = BROADCAST_STATES.PAUSED;
    this.#paused = true;
    this.#client.emit('channelAudioClientBroadcastPaused', this.#channelId);
    if (this.#worker) { this.#worker.postMessage({ type: 'pause' }); }
  }

  async resume () {
    if (this.#destroyed) { throw new AudioClientError('Cannot resume destroyed client', 'CLIENT_DESTROYED'); }
    this.broadcastState = this.#ffmpeg
      ? BROADCAST_STATES.PLAYING
      : BROADCAST_STATES.IDLE;
    this.#paused = false;
    this.#client.emit('channelAudioClientBroadcastResume', this.#channelId);
    if (this.#worker) { this.#worker.postMessage({ type: 'resume' }); }
  }

  async destroy () {
    if (this.#destroyed) { return; }
    this.#destroyed = true;

    if (this.#ffmpeg) { await this.#stopFFmpeg(); }
    if (this.#worker) {
      this.#worker.postMessage({ type: 'shutdown' });
      await this.#worker.terminate();
    }

    if (this.#peerConnection && this.#peerConnection.connectionState !== 'closed') {
      this.#peerConnection.close();
    }

    this.#cleanupTasks.forEach(task => task());
    this.#cleanupTasks.clear();

    this.#audioSource = null;
    this.#track = null;
    this.#mediaStream = null;
    this.#peerConnection = null;
    this.#worker = null;
    this.#ffmpeg = null;
    this.#leftoverSamples = null;
  }
}
