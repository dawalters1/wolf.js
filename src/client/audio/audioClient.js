import ChannelAudioSlotConnectionState from '../../constants/ChannelAudioConnectionState.js';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import path from 'path';
import { Worker } from 'node:worker_threads';
import wrtc from '@roamhq/wrtc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { nonstandard, MediaStream, RTCSessionDescription, RTCPeerConnection } = wrtc;

// Audio configuration constants
const AUDIO_CONFIG = {
  SAMPLE_RATE: 48000,
  CHANNEL_COUNT: 2,
  BITRATE: 16,
  FRAMES: 480,
  MIN_PRELOAD_FRAMES: 3,
  MAX_DRIFT_MS: 5,
  FRAME_DURATION_MS: 10,

  // Timeouts and limits
  SDP_CREATION_TIMEOUT_MS: 10000,
  WORKER_TERMINATION_TIMEOUT_MS: 5000,
  FFMPEG_GRACEFUL_SHUTDOWN_MS: 3000,
  MAX_BUFFER_QUEUE_SIZE: 100,

  // Volume constraints
  MIN_VOLUME: 0,
  MAX_VOLUME: 2
};

// Valid state enums
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

class AudioClient {
  constructor (client, channelId, settings = { volume: 1, muted: false }) {
    // Input validation
    if (!client) {
      throw new AudioClientError('Client is required', 'INVALID_CLIENT');
    }
    if (!channelId) {
      throw new AudioClientError('Channel ID is required', 'INVALID_CHANNEL_ID');
    }

    this.client = client;
    this.channelId = channelId;
    this.slotId = undefined;

    // Validate and set settings
    this.settings = this._validateSettings(settings);

    // State management
    this._broadcastState = BROADCAST_STATES.IDLE;
    this.connectionState = ChannelAudioSlotConnectionState.DISCONNECTED;
    this.state = CLIENT_STATES.DISABLED;
    this.paused = false;
    this.destroyed = false;

    // Audio buffer management
    this.leftoverSamples = new Int16Array(AUDIO_CONFIG.FRAMES * AUDIO_CONFIG.CHANNEL_COUNT);
    this.leftoverSamples.fill(0);
    this.numLeftoverSamples = 0;

    // Basic monitoring
    this.underrunCount = 0;

    // Initialize WebRTC components
    this._initializeWebRTC();

    // Initialize worker
    this._initializeWorker();

    // Cleanup tracking
    this._cleanupTasks = new Set();
    this._setupCleanupTasks();
  }

  _validateSettings (settings) {
    const validated = { ...settings };

    if (typeof validated.volume !== 'number' ||
        validated.volume < AUDIO_CONFIG.MIN_VOLUME ||
        validated.volume > AUDIO_CONFIG.MAX_VOLUME) {
      validated.volume = 1;
    }

    if (typeof validated.muted !== 'boolean') {
      validated.muted = false;
    }

    return validated;
  }

  _initializeWebRTC () {
    try {
      this.peerConnection = new RTCPeerConnection();

      this.audioSource = new nonstandard.RTCAudioSource();
      this.track = this.audioSource.createTrack();
      this.mediaStream = new MediaStream([this.track]);
      this.peerConnection.addTrack(this.track, this.mediaStream);

      this.peerConnection.onconnectionstatechange = this._handleConnectionStateChange.bind(this);
    } catch (error) {
      throw new AudioClientError('Failed to initialize WebRTC', 'WEBRTC_INIT_FAILED', error);
    }
  }

  _initializeWorker () {
    try {
      const workerPath = path.join(__dirname, 'audioWorker.js');
      this.worker = new Worker(workerPath);

      this.worker.on('message', this._handleWorkerMessage.bind(this));
      this.worker.on('error', this._handleWorkerError.bind(this));
      this.worker.on('exit', this._handleWorkerExit.bind(this));

      // Initialize worker with configuration
      this.worker.postMessage({
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
  }

  _setupCleanupTasks () {
    const cleanup = () => this.destroy().catch(console.error);

    // Register cleanup for process termination
    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);
    process.once('exit', cleanup);

    this._cleanupTasks.add(() => {
      process.removeListener('SIGINT', cleanup);
      process.removeListener('SIGTERM', cleanup);
      process.removeListener('exit', cleanup);
    });
  }

  _handleConnectionStateChange () {
    if (this.destroyed) { return; }

    const state = this.peerConnection.connectionState;

    switch (state) {
      case 'connecting':
        this.connectionState = ChannelAudioSlotConnectionState.PENDING;
        this.client.emit('channelAudioClientConnecting', this);
        break;

      case 'connected':
        if (this.connectionState === ChannelAudioSlotConnectionState.CONNECTED) {
          this.client.emit('channelAudioClientReady', this);
        } else {
          this.connectionState = ChannelAudioSlotConnectionState.CONNECTED;
          this.client.emit('channelAudioClientConnected', this);
        }
        break;

      case 'disconnected':
        this.connectionState = ChannelAudioSlotConnectionState.DISCONNECTED;
        this.client.emit('channelAudioClientDisconnected', this);
        break;

      case 'failed':
        this.connectionState = ChannelAudioSlotConnectionState.DISCONNECTED;
        this.client.emit('channelAudioClientError', new AudioClientError(
          'WebRTC connection failed', 'CONNECTION_FAILED'
        ));
        break;
    }
  }

  _handleWorkerMessage (message) {
    if (this.destroyed) { return; }

    switch (message.type) {
      case 'underrun':
        this.underrunCount = message.count;
        break;

      case 'audioFrame':
        if (message.data && this.audioSource) {
          this.audioSource.onData(message.data);
        }
        break;

      case 'error':
        this.client.emit('channelAudioClientError', new AudioClientError(
          'Worker processing error', 'WORKER_ERROR', message.error
        ));
        break;
    }
  }

  _handleWorkerError (error) {
    this.client.emit('channelAudioClientError', new AudioClientError(
      'Worker thread error', 'WORKER_THREAD_ERROR', error
    ));
  }

  _handleWorkerExit (code) {
    if (!this.destroyed && code !== 0) {
      this.client.emit('channelAudioClientError', new AudioClientError(
        `Worker exited unexpectedly with code ${code}`, 'WORKER_EXIT_ERROR'
      ));
    }
  }

  // Public API
  get broadcastState () {
    return this._broadcastState;
  }

  set broadcastState (value) {
    if (!Object.values(BROADCAST_STATES).includes(value)) {
      throw new AudioClientError(`Invalid broadcast state: ${value}`, 'INVALID_STATE');
    }

    this._broadcastState = value;
    this.state = value === BROADCAST_STATES.PLAYING
      ? CLIENT_STATES.ENABLED
      : CLIENT_STATES.DISABLED;
  }

  updateSettings (settings) {
    if (this.destroyed) {
      throw new AudioClientError('Cannot update settings on destroyed client', 'CLIENT_DESTROYED');
    }

    const newSettings = this._validateSettings(settings);
    const oldSettings = { ...this.settings };

    // Emit mute/unmute events if changed
    if (newSettings.muted !== oldSettings.muted) {
      this.client.emit(
        newSettings.muted
          ? 'channelAudioClientBroadcastMuted'
          : 'channelAudioClientBroadcastUnmuted',
        this.channelId
      );
    }

    this.settings = newSettings;

    // Update worker with new settings
    if (this.worker) {
      this.worker.postMessage({
        type: 'updateSettings',
        settings: {
          volume: this.settings.volume,
          muted: this.settings.muted
        }
      });
    }
  }

  enqueue (item) {
    if (this.destroyed) {
      throw new AudioClientError('Cannot enqueue on destroyed client', 'CLIENT_DESTROYED');
    }

    if (!item || !item.samples || !(item.samples instanceof Int16Array)) {
      throw new AudioClientError('Invalid audio data', 'INVALID_AUDIO_DATA');
    }

    this.worker.postMessage({ type: 'enqueue', data: item });
  }

  async createSDP () {
    if (this.destroyed) {
      throw new AudioClientError('Cannot create SDP on destroyed client', 'CLIENT_DESTROYED');
    }

    try {
      const sdpPromise = this._createSDPInternal();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new AudioClientError(
          'SDP creation timeout', 'SDP_TIMEOUT'
        )), AUDIO_CONFIG.SDP_CREATION_TIMEOUT_MS);
      });

      return await Promise.race([sdpPromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof AudioClientError) { throw error; }
      throw new AudioClientError('SDP creation failed', 'SDP_CREATION_ERROR', error);
    }
  }

  async _createSDPInternal () {
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });

    await this.peerConnection.setLocalDescription(offer);
    return this.peerConnection.localDescription?.sdp;
  }

  async setResponse (slotId, sdp) {
    if (this.destroyed) {
      throw new AudioClientError('Cannot set response on destroyed client', 'CLIENT_DESTROYED');
    }

    if (!slotId || !sdp) {
      throw new AudioClientError('Slot ID and SDP are required', 'INVALID_PARAMETERS');
    }

    try {
      this.slotId = slotId;
      const description = new RTCSessionDescription({ type: 'answer', sdp });
      await this.peerConnection.setRemoteDescription(description);
    } catch (error) {
      throw new AudioClientError('Failed to set remote description', 'SET_REMOTE_DESCRIPTION_ERROR', error);
    }
  }

  async play (data) {
    if (this.destroyed) { throw new AudioClientError('Cannot play on destroyed client', 'CLIENT_DESTROYED'); }
    if (!data) { throw new AudioClientError('Audio data is required', 'INVALID_AUDIO_DATA'); }

    // Stop any previous FFmpeg
    await this._stopFFmpeg();

    const FRAME_SIZE = AUDIO_CONFIG.FRAMES * AUDIO_CONFIG.CHANNEL_COUNT * 2; // 480*2*2 = 1920 bytes
    let leftoverBuffer = Buffer.alloc(0);
    let ffmpegEnded = false;
    let nextFrameTime = performance.now();

    // Function to enqueue one 10ms frame
    const enqueueFrame = () => {
      if (leftoverBuffer.length < FRAME_SIZE) { return false; }

      const frameBytes = leftoverBuffer.slice(0, FRAME_SIZE);
      leftoverBuffer = leftoverBuffer.slice(FRAME_SIZE);

      const samples = new Int16Array(FRAME_SIZE / 2);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = frameBytes.readInt16LE(i * 2);
      }

      // Apply client volume/mute
      if (this.settings.muted || this.settings.volume === 0) {
        samples.fill(0);
      } else if (this.settings.volume !== 1) {
        const volumeFixed = Math.round(this.settings.volume * 32768);
        for (let i = 0; i < samples.length; i++) {
          samples[i] = Math.max(-32768, Math.min(32767, (samples[i] * volumeFixed) >> 15));
        }
      }

      this.enqueue({
        samples,
        sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
        channelCount: AUDIO_CONFIG.CHANNEL_COUNT,
        numberOfFrames: AUDIO_CONFIG.FRAMES,
        bitsPerSample: AUDIO_CONFIG.BITRATE,
        timestamp: performance.now()
      });

      return true;
    };

    // Frame loop to respect 10ms frame duration
    const frameLoop = () => {
      if (this.destroyed) { return; }

      const now = performance.now();
      if (now >= nextFrameTime && enqueueFrame()) {
        nextFrameTime += AUDIO_CONFIG.FRAME_DURATION_MS;
      }

      // Finish broadcast only after FFmpeg ends and buffer is empty
      if (ffmpegEnded && leftoverBuffer.length === 0) {
        this.broadcastState = BROADCAST_STATES.IDLE;
        this.client.emit('channelAudioClientBroadcastFinished', this.channelId);
        return;
      }

      setImmediate(frameLoop);
    };

    // Start the broadcast
    this.broadcastState = BROADCAST_STATES.PLAYING;
    this.client.emit('channelAudioClientBroadcastStarted', this.channelId);

    // Run frame loop
    frameLoop();

    // Start FFmpeg
    this.ffmpeg = ffmpeg()
      .input(data)
      .toFormat('wav')
      .audioChannels(AUDIO_CONFIG.CHANNEL_COUNT)
      .audioFrequency(AUDIO_CONFIG.SAMPLE_RATE)
      .noVideo()
      .on('error', err => {
        this.client.emit('channelAudioClientError', new AudioClientError('FFmpeg processing error', 'FFMPEG_ERROR', err));
      })
      .pipe()
      .on('data', chunk => {
        leftoverBuffer = Buffer.concat([leftoverBuffer, chunk]);
      })
      .on('end', () => {
        ffmpegEnded = true;
      });
  }

  async _stopFFmpeg () {
    if (!this.ffmpeg) { return; }

    this.ffmpeg?.kill('SIGKILL');
  }

  async stop () {
    if (this.destroyed) {
      throw new AudioClientError('Cannot stop destroyed client', 'CLIENT_DESTROYED');
    }

    try {
      await this._stopFFmpeg();
      this.broadcastState = BROADCAST_STATES.IDLE;
      this.client.emit('channelAudioClientBroadcastStopped', this.channelId);
    } catch (error) {
      throw new AudioClientError('Stop operation failed', 'STOP_FAILED', error);
    }
  }

  async pause () {
    if (this.destroyed) {
      throw new AudioClientError('Cannot pause destroyed client', 'CLIENT_DESTROYED');
    }

    try {
      this.broadcastState = BROADCAST_STATES.PAUSED;
      this.paused = true;
      this.client.emit('channelAudioClientBroadcastPaused', this.channelId);

      if (this.worker) {
        this.worker.postMessage({ type: 'pause' });
      }
    } catch (error) {
      throw new AudioClientError('Pause operation failed', 'PAUSE_FAILED', error);
    }
  }

  async resume () {
    if (this.destroyed) {
      throw new AudioClientError('Cannot resume destroyed client', 'CLIENT_DESTROYED');
    }

    try {
      this.broadcastState = this.ffmpeg
        ? BROADCAST_STATES.PLAYING
        : BROADCAST_STATES.IDLE;
      this.paused = false;
      this.client.emit('channelAudioClientBroadcastResume', this.channelId);

      if (this.worker) {
        this.worker.postMessage({ type: 'resume' });
      }
    } catch (error) {
      throw new AudioClientError('Resume operation failed', 'RESUME_FAILED', error);
    }
  }

  async destroy () {
    if (this.destroyed) { return; }

    this.destroyed = true;
    const cleanupPromises = [];

    // Stop audio processing
    if (this.ffmpeg) {
      cleanupPromises.push(this._stopFFmpeg());
    }

    // Terminate worker
    if (this.worker) {
      this.worker.postMessage({ type: 'shutdown' });

      cleanupPromises.push(this.worker.terminate());
    }

    // Close WebRTC connection
    if (this.peerConnection && this.peerConnection.connectionState !== 'closed') {
      this.peerConnection.close();
    }

    // Run cleanup tasks
    this._cleanupTasks.forEach(task => task());
    this._cleanupTasks.clear();

    await Promise.all(cleanupPromises);

    // Clear references
    this.audioSource = null;
    this.track = null;
    this.mediaStream = null;
    this.peerConnection = null;
    this.worker = null;
    this.ffmpeg = null;
    this.leftoverSamples = null;
  }
}

export default AudioClient;
