// Chatgpt code

import { parentPort } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

const bufferQueue = [];
let processing = false;
let paused = false;
let underrunCount = 0;
let FRAME_DURATION_MS = 9.9;
let nextFrameTime = 0;
let volume = 1;

// Clamp helper for 16-bit signed integer
function clampInt16 (value) {
  return Math.min(32767, Math.max(-32768, Math.round(value)));
}

parentPort.on('message', (msg) => {
  if (msg.type === 'init') {
    FRAME_DURATION_MS = msg.frameDurationMs || 9.9;
    nextFrameTime = performance.now();
  } else if (msg.type === 'enqueue') {
    bufferQueue.push(msg.data);
    if (!processing && !paused && bufferQueue.length >= 3) {
      startProcessing();
    }
  } else if (msg.type === 'pause') {
    paused = true;
  } else if (msg.type === 'resume') {
    paused = false;
    if (!processing && bufferQueue.length >= 3) {
      startProcessing();
    }
  } else if (msg.type === 'updateVolume') {
    volume = msg.volume;
  }
});

function startProcessing () {
  if (processing) {
    return;
  }
  processing = true;

  const MAX_DRIFT_MS = 5;

  function processNext () {
    if (paused) {
      processing = false;
      return;
    }

    if (bufferQueue.length === 0) {
      underrunCount++;
      processing = false;
      parentPort.postMessage({ type: 'underrun', count: underrunCount });
      return;
    }

    const now = performance.now();
    if (now < nextFrameTime) {
      setTimeout(processNext, nextFrameTime - now);
      return;
    }

    const data = bufferQueue.shift();

    // IMPORTANT: samples should be Int16Array
    // Apply volume here, modify samples in-place
    const samples = data.samples;
    for (let i = 0; i < samples.length; i++) {
      samples[i] = clampInt16(samples[i] * volume);
    }

    parentPort.postMessage({ type: 'audioFrame', data });

    nextFrameTime += FRAME_DURATION_MS;

    if (performance.now() > nextFrameTime + MAX_DRIFT_MS) {
      nextFrameTime = performance.now() + FRAME_DURATION_MS;
    }

    setImmediate(processNext);
  }

  setImmediate(processNext);
}
