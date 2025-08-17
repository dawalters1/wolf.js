import { parentPort } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

// Configuration defaults
let config = {
  frameDurationMs: 10,
  sampleRate: 48000,
  channelCount: 2,
  frames: 480,
  maxQueueSize: 100,
  maxDriftMs: 5,
  minPreloadFrames: 3
};

// Worker state
const state = {
  bufferQueue: [],
  processing: false,
  paused: false,
  shutdown: false,
  underrunCount: 0,
  nextFrameTime: 0,
  volume: 1,
  muted: false
};

// Fixed-point precision for volume
const VOLUME_PRECISION_BITS = 15;

// Clamp to 16-bit signed integer
function clampInt16 (value) {
  return Math.min(32767, Math.max(-32768, Math.round(value)));
}

// Apply volume in-place
function applyVolume (samples, volume, muted) {
  if (muted || volume === 0) {
    samples.fill(0);
    return;
  }

  if (volume === 1) { return; }

  const volumeFixed = Math.round(volume * (1 << VOLUME_PRECISION_BITS));
  for (let i = 0; i < samples.length; i++) {
    samples[i] = clampInt16((samples[i] * volumeFixed) >> VOLUME_PRECISION_BITS);
  }
}

// Validate audio frame
function validateAudioFrame (data) {
  if (!data || typeof data !== 'object') { return false; }
  if (!(data.samples instanceof Int16Array)) { return false; }
  if (typeof data.sampleRate !== 'number' || data.sampleRate <= 0) { return false; }
  if (typeof data.channelCount !== 'number' || data.channelCount <= 0) { return false; }
  if (typeof data.numberOfFrames !== 'number' || data.numberOfFrames <= 0) { return false; }

  const expectedSamples = data.numberOfFrames * data.channelCount;
  return data.samples.length === expectedSamples;
}

// Calculate frame duration in ms
function calculateFrameDuration (sampleRate, frames) {
  return (frames / sampleRate) * 1000;
}

// Initialize worker
function initialize (newConfig) {
  if (newConfig && typeof newConfig === 'object') {
    config = { ...config, ...newConfig };
  }
  config.frameDurationMs = calculateFrameDuration(config.sampleRate, config.frames);

  state.nextFrameTime = performance.now();
  state.bufferQueue.length = 0;
  state.processing = false;
  state.paused = false;
  state.underrunCount = 0;

  parentPort?.postMessage({ type: 'initialized', config: { ...config } });
}

// Enqueue audio data
function enqueueAudioData (data) {
  if (!validateAudioFrame(data)) {
    parentPort?.postMessage({ type: 'error', error: 'Invalid audio frame data' });
    return;
  }

  if (state.bufferQueue.length >= config.maxQueueSize) {
    state.bufferQueue.shift(); // drop oldest frame
  }

  state.bufferQueue.push(data);

  if (!state.processing && !state.paused && state.bufferQueue.length >= config.minPreloadFrames) {
    startProcessing();
  }
}

// Update settings
function updateSettings (settings) {
  if (!settings || typeof settings !== 'object') { return; }

  if (typeof settings.volume === 'number' && settings.volume >= 0 && settings.volume <= 2) {
    state.volume = settings.volume;
  }

  if (typeof settings.muted === 'boolean') {
    state.muted = settings.muted;
  }
}

// Pause/resume
function pauseProcessing () {
  state.paused = true;
  state.processing = false;
}

function resumeProcessing () {
  state.paused = false;
  if (!state.processing && state.bufferQueue.length >= config.minPreloadFrames) {
    startProcessing();
  }
}

// Start processing loop
function startProcessing () {
  if (state.processing || state.shutdown) { return; }
  state.processing = true;
  setImmediate(processNext);
}

// Process next frame
function processNext () {
  if (state.paused || state.shutdown) {
    state.processing = false;
    return;
  }

  if (state.bufferQueue.length === 0) {
    handleUnderrun();
    return;
  }

  const now = performance.now();
  if (now < state.nextFrameTime) {
    setTimeout(processNext, Math.max(0, state.nextFrameTime - now));
    return;
  }

  const data = state.bufferQueue.shift();

  // Process in-place
  applyVolume(data.samples, state.volume, state.muted);

  parentPort?.postMessage({ type: 'audioFrame', data });

  // Smooth drift correction
  const drift = now - state.nextFrameTime;
  if (Math.abs(drift) > config.maxDriftMs) {
    state.nextFrameTime += drift * 0.1;
  } else {
    state.nextFrameTime += config.frameDurationMs;
  }

  setImmediate(processNext);
}

// Handle underrun
function handleUnderrun () {
  state.underrunCount++;
  state.processing = false;
  parentPort?.postMessage({ type: 'underrun', count: state.underrunCount });
}

// Shutdown worker
function shutdown () {
  state.shutdown = true;
  state.processing = false;
  state.bufferQueue.length = 0;
  parentPort?.postMessage({ type: 'shutdown' });
}

// Message handler
function handleMessage (msg) {
  if (!msg || typeof msg.type !== 'string') {
    parentPort?.postMessage({ type: 'error', error: 'Invalid message format' });
    return;
  }

  switch (msg.type) {
    case 'init': initialize(msg.config); break;
    case 'enqueue': enqueueAudioData(msg.data); break;
    case 'updateSettings': updateSettings(msg.settings); break;
    case 'pause': pauseProcessing(); break;
    case 'resume': resumeProcessing(); break;
    case 'shutdown': shutdown(); break;
    case 'updateVolume':
      if (typeof msg.volume === 'number') { updateSettings({ volume: msg.volume }); }
      break;
    default:
      parentPort?.postMessage({ type: 'error', error: `Unknown message type: ${msg.type}` });
  }
}

// Setup message handling
if (parentPort) {
  parentPort.on('message', handleMessage);

  process.on('uncaughtException', e => parentPort?.postMessage({ type: 'error', error: `Uncaught exception: ${e.message}` }));
  process.on('unhandledRejection', r => parentPort?.postMessage({ type: 'error', error: `Unhandled rejection: ${r}` }));
}
