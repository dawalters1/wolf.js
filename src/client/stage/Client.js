/* eslint-disable no-unused-vars */
import { StageBroadcastState, StageConnectionState } from '../../constants/index.js';
import events from 'events';
import wrtc from 'wrtc';
import ffmpeg from 'fluent-ffmpeg';

const EventEmitter = events.EventEmitter;
const { RTCSessionDescription, RTCPeerConnection } = wrtc;
const { RTCAudioSource } = wrtc.nonstandard;
const MediaStream = wrtc.MediaStream;

const SAMPLE_RATE = 48000;
const SLICE_COUNT = 1920;
const CHANNEL_COUNT = 2;
const BITRATE = 16;
const FRAMES = 480;

const setIntervalAsync = (fn) => fn().then((ms) => setTimeout(() => setIntervalAsync(fn, ms), ms));

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

  }

  stop () {

  }
}

export default Client;
