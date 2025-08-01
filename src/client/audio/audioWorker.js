import { parentPort } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

// Configuration with sensible defaults
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

// Constants
const VOLUME_PRECISION_BITS = 15; // For fixed-point volume calculations

/**
 * Clamp value to 16-bit signed integer range
 * @param {number} value - The value to clamp
 * @returns {number} Clamped value
 */
function clampInt16 (value) {
  return Math.min(32767, Math.max(-32768, Math.round(value)));
}

/**
 * Apply volume to audio samples with optimizations
 * @param {Int16Array} samples - Audio samples to modify
 * @param {number} volume - Volume multiplier (0.0 to 2.0)
 * @param {boolean} muted - Whether audio is muted
 */
function applyVolume (samples, volume, muted) {
  if (muted || volume === 0) {
    samples.fill(0);
    return;
  }

  if (volume === 1) {
    return; // No processing needed
  }

  // Use fixed-point arithmetic for better performance
  const volumeFixed = Math.round(volume * (1 << VOLUME_PRECISION_BITS));

  for (let i = 0; i < samples.length; i++) {
    const scaled = (samples[i] * volumeFixed) >> VOLUME_PRECISION_BITS;
    samples[i] = clampInt16(scaled);
  }
}

/**
 * Validate audio frame data
 * @param {object} data - Audio frame data
 * @returns {boolean} True if valid
 */
function validateAudioFrame (data) {
  if (!data || typeof data !== 'object') { return false; }
  if (!(data.samples instanceof Int16Array)) { return false; }
  if (typeof data.sampleRate !== 'number' || data.sampleRate <= 0) { return false; }
  if (typeof data.channelCount !== 'number' || data.channelCount <= 0) { return false; }
  if (typeof data.numberOfFrames !== 'number' || data.numberOfFrames <= 0) { return false; }

  // Check if sample count matches expected frame size
  const expectedSamples = data.numberOfFrames * data.channelCount;
  if (data.samples.length !== expectedSamples) { return false; }

  return true;
}

/**
 * Calculate precise frame duration from sample rate and frame count
 * @param {number} sampleRate - Audio sample rate
 * @param {number} frames - Number of frames per chunk
 * @returns {number} Frame duration in milliseconds
 */
function calculateFrameDuration (sampleRate, frames) {
  return (frames / sampleRate) * 1000;
}

/**
 * Initialize worker with configuration
 * @param {object} newConfig - Configuration object
 */
function initialize (newConfig) {
  try {
    // Validate and merge configuration
    if (newConfig && typeof newConfig === 'object') {
      config = { ...config, ...newConfig };
    }

    // Calculate precise frame duration
    config.frameDurationMs = calculateFrameDuration(config.sampleRate, config.frames);

    // Initialize timing
    state.nextFrameTime = performance.now();

    // Reset state
    state.bufferQueue.length = 0;
    state.processing = false;
    state.paused = false;
    state.underrunCount = 0;

    // Send acknowledgment
    parentPort?.postMessage({
      type: 'initialized',
      config: { ...config }
    });
  } catch (error) {
    parentPort?.postMessage({
      type: 'error',
      error: `Initialization failed: ${error.message}`
    });
  }
}

/**
 * Enqueue audio data for processing
 * @param {object} data - Audio frame data
 */
function enqueueAudioData (data) {
  try {
    if (!validateAudioFrame(data)) {
      parentPort?.postMessage({
        type: 'error',
        error: 'Invalid audio frame data'
      });
      return;
    }

    // Check queue size limit
    if (state.bufferQueue.length >= config.maxQueueSize) {
      // Drop oldest frame to prevent memory buildup
      state.bufferQueue.shift();
    }

    state.bufferQueue.push(data);

    // Start processing if conditions are met
    if (!state.processing && !state.paused && state.bufferQueue.length >= config.minPreloadFrames) {
      startProcessing();
    }
  } catch (error) {
    parentPort?.postMessage({
      type: 'error',
      error: `Enqueue failed: ${error.message}`
    });
  }
}

/**
 * Update audio settings
 * @param {object} settings - New settings
 */
function updateSettings (settings) {
  try {
    if (!settings || typeof settings !== 'object') { return; }

    if (typeof settings.volume === 'number' && settings.volume >= 0 && settings.volume <= 2) {
      state.volume = settings.volume;
    }

    if (typeof settings.muted === 'boolean') {
      state.muted = settings.muted;
    }
  } catch (error) {
    parentPort?.postMessage({
      type: 'error',
      error: `Settings update failed: ${error.message}`
    });
  }
}

/**
 * Pause audio processing
 */
function pauseProcessing () {
  state.paused = true;
  state.processing = false;
}

/**
 * Resume audio processing
 */
function resumeProcessing () {
  state.paused = false;

  if (!state.processing && state.bufferQueue.length >= config.minPreloadFrames) {
    startProcessing();
  }
}

/**
 * Start the audio processing loop
 */
function startProcessing () {
  if (state.processing || state.shutdown) { return; }

  state.processing = true;

  setImmediate(processNext);
}

/**
 * Process the next audio frame
 */
function processNext () {
  try {
    // Check if we should stop processing
    if (state.paused || state.shutdown) {
      state.processing = false;
      return;
    }

    // Check if we have data to process
    if (state.bufferQueue.length === 0) {
      handleUnderrun();
      return;
    }

    // Check timing - don't process too early
    const now = performance.now();
    if (now < state.nextFrameTime) {
      setTimeout(processNext, Math.max(0, state.nextFrameTime - now));
      return;
    }

    // Get next frame
    const data = state.bufferQueue.shift();

    // Create a copy of samples to avoid modifying original
    const samples = new Int16Array(data.samples);

    // Apply volume and mute
    applyVolume(samples, state.volume, state.muted);

    // Create processed frame data
    const processedData = {
      ...data,
      samples
    };

    // Send to main thread
    parentPort?.postMessage({
      type: 'audioFrame',
      data: processedData
    });

    // Update timing
    state.nextFrameTime += config.frameDurationMs;

    // Handle timing drift
    if (now > state.nextFrameTime + config.maxDriftMs) {
      state.nextFrameTime = now + config.frameDurationMs;
    }

    // Schedule next frame
    setImmediate(processNext);
  } catch (error) {
    parentPort?.postMessage({
      type: 'error',
      error: `Frame processing failed: ${error.message}`
    });

    // Try to continue processing
    setTimeout(processNext, config.frameDurationMs);
  }
}

/**
 * Handle audio underrun condition
 */
function handleUnderrun () {
  state.underrunCount++;
  state.processing = false;

  parentPort?.postMessage({
    type: 'underrun',
    count: state.underrunCount
  });
}

/**
 * Shutdown the worker gracefully
 */
function shutdown () {
  state.shutdown = true;
  state.processing = false;

  // Clear buffer queue
  state.bufferQueue.length = 0;

  parentPort?.postMessage({
    type: 'shutdown'
  });
}

/**
 * Handle messages from the main thread
 */
function handleMessage (msg) {
  try {
    if (!msg || typeof msg.type !== 'string') {
      parentPort?.postMessage({
        type: 'error',
        error: 'Invalid message format'
      });
      return;
    }

    switch (msg.type) {
      case 'init':
        initialize(msg.config);
        break;

      case 'enqueue':
        enqueueAudioData(msg.data);
        break;

      case 'updateSettings':
        updateSettings(msg.settings);
        break;

      case 'pause':
        pauseProcessing();
        break;

      case 'resume':
        resumeProcessing();
        break;

      case 'shutdown':
        shutdown();
        break;

      // Legacy support for older message format
      case 'updateVolume':
        if (typeof msg.volume === 'number') {
          updateSettings({ volume: msg.volume });
        }
        break;

      default:
        parentPort?.postMessage({
          type: 'error',
          error: `Unknown message type: ${msg.type}`
        });
    }
  } catch (error) {
    parentPort?.postMessage({
      type: 'error',
      error: `Message handling failed: ${error.message}`
    });
  }
}

// Set up message handling
if (parentPort) {
  parentPort.on('message', handleMessage);

  // Handle worker thread errors
  process.on('uncaughtException', (error) => {
    parentPort?.postMessage({
      type: 'error',
      error: `Uncaught exception: ${error.message}`
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    parentPort?.postMessage({
      type: 'error',
      error: `Unhandled rejection: ${reason}`
    });
  });
}
