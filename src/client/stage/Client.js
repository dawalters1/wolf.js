/* eslint-disable no-unused-vars */
import { StageBroadcastState, StageConnectionState } from '../../constants/index.js';
import events from 'events';
import wrtc from 'wrtc';
import ffmpeg from 'fluent-ffmpeg';

const spawn = require('child_process').spawn;

const EventEmitter = events.EventEmitter;
const { RTCSessionDescription, RTCPeerConnection } = wrtc;
const { RTCAudioSource } = wrtc.nonstandard;
const MediaStream = wrtc.MediaStream;

const SAMPLE_RATE = 48000;
const SLICE_COUNT = 1920;
const CHANNEL_COUNT = 2;
const BITRATE = 16;
const FRAMES = 480;

const setIntervalAsync = (fn) => fn().then(async (ms) => await new Promise(resolve => setTimeout(() => resolve(setIntervalAsync(fn, ms)), ms)));

class Client extends EventEmitter {
  constructor (client) {
    super();

    this.client = client;

    this._slotId = undefined;
    this._muted = undefined;

    this.broadcastState = StageBroadcastState.IDLE;
    this.connectionState = StageConnectionState.DISCONNECTED;
    this.client = new RTCPeerConnection();
    this.source = new RTCAudioSource();

    const stream = new MediaStream();

    this.track = this.source.createTrack();
    stream.addTrack(this.track);
    this.sender = this.client.addTrack(this.track, stream);
  }

  get slotId () {
    return this._slotId;
  }

  get muted () {
    return this._muted;
  }

  play (data) {
    let completed = false;

    this.samples = new Int16Array(0);

    this._ffmpeg = ffmpeg(data)
      .toFormat('wav')
      .native()
      .noVideo()
      .withOptions()
      .on('error', () => { })
      .pipe()
      .on('data', (data) => {
        const newSamples = new Int16Array(data.buffer);
        const mergedSamples = new Int16Array(this.samples.length + newSamples.length);

        mergedSamples.set(this.samples);
        mergedSamples.set(newSamples, this.samples.length);
        this.samples = mergedSamples;
      })
      .on('finish', () => { completed = true; });
  }

  stop () {

  }
}

export default Client;
