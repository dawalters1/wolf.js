import { parentPort } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

/** ---------------- CONFIG & CONSTANTS ---------------- **/
let config = {
  frameDurationMs: 10,
  sampleRate: 48000,
  channelCount: 2,
  frames: 480,
  maxQueueSize: 100,
  maxDriftMs: 5,
  minPreloadFrames: 3,
  statsIntervalMs: 1000
};

const VOLUME_PRECISION_BITS = 15;

/** ---------------- CIRCULAR QUEUE ---------------- **/
class CircularQueue {
  constructor (maxSize) {
    this.queue = new Array(maxSize);
    this.start = 0;
    this.end = 0;
    this.size = 0;
    this.maxSize = maxSize;
  }

  enqueue = (item) => {
    if (this.size === this.maxSize) { this.start = (this.start + 1) % this.maxSize; }
    this.queue[this.end] = item;
    this.end = (this.end + 1) % this.maxSize;
    this.size = Math.min(this.size + 1, this.maxSize);
  };

  dequeue = () => {
    if (this.size === 0) { return null; }
    const item = this.queue[this.start];
    this.start = (this.start + 1) % this.maxSize;
    this.size--;
    return item;
  };

  get length () { return this.size; }

  clear = () => {
    this.start = this.end = this.size = 0;
  };
}

/** ---------------- STATE ---------------- **/
const state = {
  bufferQueue: new CircularQueue(config.maxQueueSize),
  processing: false,
  paused: false,
  shutdown: false,
  underrunCount: 0,
  nextFrameTimeMs: 0,
  volume: 1,
  muted: false
};

/** ---------------- UTILITIES ---------------- **/
const clampInt16 = (value) => Math.min(32767, Math.max(-32768, Math.round(value)));

const applyVolume = (samples, volume, muted) => {
  if (muted || volume === 0) { return samples.fill(0); }
  if (volume === 1) { return; }

  const volumeFixed = Math.round(volume * (1 << VOLUME_PRECISION_BITS));
  for (let i = 0; i < samples.length; i++) {
    samples[i] = clampInt16((samples[i] * volumeFixed) >> VOLUME_PRECISION_BITS);
  }
};

const validateAudioFrame = (data) => {
  if (!data || typeof data !== 'object') { return false; }
  if (!(data.samples instanceof Int16Array)) { return false; }
  if (typeof data.sampleRate !== 'number' || data.sampleRate <= 0) { return false; }
  if (typeof data.channelCount !== 'number' || data.channelCount <= 0) { return false; }
  if (typeof data.numberOfFrames !== 'number' || data.numberOfFrames <= 0) { return false; }
  return data.samples.length === data.numberOfFrames * data.channelCount;
};

const calculateFrameDuration = (sampleRate, frames) => (frames / sampleRate) * 1000;

const safePostError = (msg, error) => {
  parentPort?.postMessage({
    type: 'error',
    error: `${msg}: ${error.stack || error.message}`
  });
};

/** ---------------- INITIALIZATION ---------------- **/
const initialize = (newConfig) => {
  try {
    if (newConfig && typeof newConfig === 'object') {
      config = { ...config, ...newConfig };
      state.bufferQueue = new CircularQueue(config.maxQueueSize);
    }
    config.frameDurationMs = calculateFrameDuration(config.sampleRate, config.frames);
    state.nextFrameTimeMs = performance.now();
    state.paused = false;
    state.processing = false;
    state.underrunCount = 0;

    parentPort?.postMessage({ type: 'initialized', config });
  } catch (err) {
    safePostError('Initialization failed', err);
  }
};

/** ---------------- AUDIO QUEUE ---------------- **/
const enqueueAudioData = (data) => {
  try {
    if (!validateAudioFrame(data)) {
      parentPort?.postMessage({ type: 'error', error: 'Invalid audio frame data' });
      return;
    }
    state.bufferQueue.enqueue(data);

    if (!state.processing && !state.paused && state.bufferQueue.length >= config.minPreloadFrames) {
      startProcessing();
    }
  } catch (err) {
    safePostError('Enqueue failed', err);
  }
};

/** ---------------- SETTINGS ---------------- **/
const updateSettings = (settings) => {
  try {
    if (!settings || typeof settings !== 'object') { return; }
    if (typeof settings.volume === 'number' && settings.volume >= 0 && settings.volume <= 2) {
      state.volume = settings.volume;
    }
    if (typeof settings.muted === 'boolean') { state.muted = settings.muted; }
  } catch (err) {
    safePostError('Settings update failed', err);
  }
};

/** ---------------- PROCESSING LOOP ---------------- **/
const startProcessing = () => {
  if (state.processing || state.shutdown) { return; }
  state.processing = true;
  requestNextFrame();
};

const requestNextFrame = () => {
  if (state.paused || state.shutdown) { return; }
  const now = performance.now();
  const delay = Math.max(0, state.nextFrameTimeMs - now);
  setTimeout(processNext, delay);
};

const processNext = () => {
  try {
    if (state.paused || state.shutdown) {
      state.processing = false;
      return;
    }

    const data = state.bufferQueue.dequeue();
    if (!data) { return handleUnderrun(); }

    const samples = new Int16Array(data.samples);
    applyVolume(samples, state.volume, state.muted);

    parentPort?.postMessage({ type: 'audioFrame', data: { ...data, samples } });

    state.nextFrameTimeMs += config.frameDurationMs;
    if (performance.now() > state.nextFrameTimeMs + config.maxDriftMs) {
      state.nextFrameTimeMs = performance.now() + config.frameDurationMs;
    }

    requestNextFrame();
  } catch (err) {
    safePostError('Frame processing failed', err);
    setTimeout(processNext, config.frameDurationMs);
  }
};

/** ---------------- UNDERRUN ---------------- **/
const handleUnderrun = () => {
  state.underrunCount++;
  state.processing = false;
  parentPort?.postMessage({ type: 'underrun', count: state.underrunCount });
};

/** ---------------- PAUSE / RESUME ---------------- **/
const pauseProcessing = () => { state.paused = true; state.processing = false; };
const resumeProcessing = () => {
  state.paused = false;
  if (!state.processing && state.bufferQueue.length >= config.minPreloadFrames) { startProcessing(); }
};

/** ---------------- SHUTDOWN ---------------- **/
const shutdown = () => {
  state.shutdown = true;
  state.processing = false;
  state.bufferQueue.clear();
  parentPort?.postMessage({ type: 'shutdown' });
};

/** ---------------- STATS MONITORING ---------------- **/
if (config.statsIntervalMs > 0) {
  setInterval(() => {
    parentPort?.postMessage({
      type: 'stats',
      queueLength: state.bufferQueue.length,
      underrunCount: state.underrunCount,
      nextFrameTimeMs: state.nextFrameTimeMs
    });
  }, config.statsIntervalMs);
}

/** ---------------- MESSAGE HANDLER ---------------- **/
const handleMessage = (msg) => {
  try {
    if (!msg || typeof msg.type !== 'string') { return; }
    switch (msg.type) {
      case 'init': initialize(msg.config); break;
      case 'enqueue': enqueueAudioData(msg.data); break;
      case 'updateSettings': updateSettings(msg.settings); break;
      case 'updateVolume':
        if (typeof msg.volume === 'number') { updateSettings({ volume: msg.volume }); }
        break;
      case 'pause': pauseProcessing(); break;
      case 'resume': resumeProcessing(); break;
      case 'shutdown': shutdown(); break;
      default:
        parentPort?.postMessage({ type: 'error', error: `Unknown message type: ${msg.type}` });
    }
  } catch (err) {
    safePostError('Message handling failed', err);
  }
};

/** ---------------- WORKER SETUP ---------------- **/
if (parentPort) {
  parentPort.on('message', handleMessage);
  process.on('uncaughtException', (err) => safePostError('Uncaught exception', err));
  process.on('unhandledRejection', (reason) => safePostError('Unhandled rejection', reason));
}
