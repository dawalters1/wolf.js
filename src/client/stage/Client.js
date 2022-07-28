const { StageBroadcastState, StageConnectionState } = require('../../constants');

const EventEmitter = require('events').EventEmitter;
const wrtc = require('wrtc');
const { RTCSessionDescription, RTCPeerConnection } = wrtc;
const { RTCAudioSource } = require('wrtc').nonstandard;
const MediaStream = require('wrtc').MediaStream;
const ffmpeg = require('fluent-ffmpeg');

const SAMPLE_RATE = 48000;
const SLICE_COUNT = 1920;
const CHANNEL_COUNT = 2;
const BITRATE = 16;
const FRAMES = 480;

const setIntervalAsync = (fn) => {
  fn().then((ms) => {
    setTimeout(() => setIntervalAsync(fn, ms), ms);
  });
};

class Client {
  constructor (client) {
    this.client = client;

    this.broadcastState = StageBroadcastState.IDLE;
    this.connectionState = StageConnectionState.DISCONNECTED;

    this.client = new RTCPeerConnection();
    this.source = new RTCAudioSource();
    const stream = new MediaStream();
    this.track = this.source.createTrack();
    stream.addTrack(this.track);

    this.sender = this.client.addTrack(this.track, stream);
  }

  play (stream) {

  }

  stop () {

  }
}

module.exports = Client;
