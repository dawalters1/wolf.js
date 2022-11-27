const EventEmitter = require('events').EventEmitter;
const wrtc = require('wrtc');
const { RTCSessionDescription, RTCPeerConnection } = wrtc;
const { RTCAudioSource } = require('wrtc').nonstandard;
const MediaStream = require('wrtc').MediaStream;
const ffmpeg = require('fluent-ffmpeg');

const { connectionState, broadcastState, events } = require('./constants');

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

const delay = async (duration) => new Promise(resolve => {
  setTimeout(resolve, duration);
});

class Client extends EventEmitter {
  constructor (targetGroupId, opts) {
    super();
    this._slotId = -1;

    this._targetGroupId = targetGroupId;
    this._connectionState = connectionState.UNINITIALIZED;
    this._broadcastState = broadcastState.NOT_BROADCASTING;
    this._muted = false;
    this._opts = opts;
    this._client = new RTCPeerConnection();

    this._chunks = [];
    this._samples = [];
    this._duration = 0;

    this._source = new RTCAudioSource();
    const stream = new MediaStream();
    this._track = this._source.createTrack();
    stream.addTrack(this._track);

    this._sender = this._client.addTrack(this._track, stream);

    setIntervalAsync(async () => {
      if (this._broadcastState !== broadcastState.BROADCASTING) {
        return Promise.resolve(10);
      }

      if (this._chunks.length === 0) {
        if (this._downloadComplete) {
          this.stop(true);
        }
        return Promise.resolve(0);
      }

      const data = this._chunks.shift();

      this._duration += 10;

      if (this._duration % 1000 === 0) {
        this._emit(events.BROADCAST_DURATION, this._duration);
      }

      if (this._muted) {
        return Promise.resolve(9.9);
      }

      this._source.onData(data);

      return Promise.resolve(9.9);
    });

    this._downloadComplete = false;

    this._client.onconnectionstatechange = async () => {
      if (this._client.connectionState === 'connected') {
        if (this._connectionState === connectionState.UNINITIALIZED || this._connectionState === connectionState.DISCONNECTED) {
          this._connectionState = connectionState.CONNECTING;
          this._emit(events.CONNECTING);
        } else if (this._connectionState === connectionState.CONNECTING) {
          this._connectionState = connectionState.CONNECTED;

          await delay(2000);

          this._connectionState = connectionState.READY;

          this._emit(events.READY);
        }
      } else if (this._client.connectionState === 'disconnected') {
        this._connectionState = connectionState.DISCONNECTED;

        this._reset();

        this._client.close();

        this._emit(events.DISCONNECTED);
      }

      return Promise.resolve();
    };
  }

  _reset (resetTrack = false) {
    if (this._ffmpeg) {
      this._ffmpeg.destroy();
    }

    if (this._downloader && typeof this._downloader === 'object') {
      this._downloader.destroy();
    }

    this._chunks = [];
    this._samples = [];
    this._duration = 0;

    this._downloadComplete = false;

    if (resetTrack) {
      this._source = new RTCAudioSource();
      this._track = this._source.createTrack();
      const mediaStream = new MediaStream();
      mediaStream.addTrack(this._track);

      this._sender.replaceTrack(this._track);
    }
  }

  _emit (command, data = {}) {
    this.emit(
      command,
      Object.assign(data,
        {
          client: this,
          duration: this.duration,
          slotId: this._slotId
        }
      )
    );
  }

  _handleSlotUpdate (slot, sourceSubscriberId) {
    if (slot.occupierId !== null) {
      if (this._muted && !slot.occupierMuted) {
        this._muted = false;
        this._emit(events.BROADCAST_UNMUTED, { sourceSubscriberId });
      } else if (!this._muted && slot.occupierMuted) {
        this._muted = true;
        this._emit(events.BROADCAST_MUTED, { sourceSubscriberId });
      } else if (!slot.locked) {
        return Promise.resolve();
      }
    } else {
      this._connectionState = connectionState.DISCONNECTED;

      this._reset();

      this._client.close();

      this._emit(sourceSubscriberId !== undefined ? events.KICKED : events.DISCONNECTED, { sourceSubscriberId });
    }
  }

  broadcast (data) {
    this._reset(false);

    this._downloader = data;

    if (this._broadcastState !== broadcastState.PAUSED) {
      this._broadcastState = broadcastState.BROADCASTING;
      this._emit(events.BROADCAST_START);
    }

    this._ffmpeg = ffmpeg(this._downloader)
      .toFormat('wav')
      .native()
      .noVideo()
      .withOptions(this._opts)
      .on('error', error => {
        if (this._downloader && typeof this._downloader === 'object') {
          this._downloader.destroy();
        }

        if (this._broadcastState !== broadcastState.BROADCASTING) {
          return Promise.resolve();
        }

        this._emit(events.BROADCAST_ERROR, error);
      })
      .pipe()
      .on('data', (chunk) => {
        const newSamples = new Int8Array(chunk);
        const mergedSamples = new Int8Array(this._samples.length + newSamples.length);
        mergedSamples.set(this._samples);
        mergedSamples.set(newSamples, this._samples.length);
        this._samples = mergedSamples;

        while (this._samples.length > SLICE_COUNT) {
          this._chunks.push({
            samples: this._samples.slice(0, SLICE_COUNT),
            sampleRate: SAMPLE_RATE,
            bitsPerSample: BITRATE,
            channelCount: CHANNEL_COUNT,
            numberOfFrames: FRAMES
          });

          this._samples = this._samples.slice(SLICE_COUNT);
        }
      })
      .on('finish', () => {
        this._downloadComplete = true;
      })
    ;
  }

  async pause () {
    this._broadcastState = broadcastState.PAUSED;

    this._emit(events.BROADCAST_PAUSED);

    return this.duration;
  }

  async resume () {
    this._broadcastState = this._chunks.length > 0 ? broadcastState.BROADCASTING : broadcastState.NOT_BROADCASTING;

    this._emit(events.BROADCAST_RESUME);

    return this.duration;
  }

  async disconnect () {
    this._reset();
    this._client.close();

    return Promise.resolve();
  }

  async stop (stoppedByClient = false) {
    if (this._broadcastState === broadcastState.NOT_BROADCASTING) {
      return Promise.resolve();
    }

    this._broadcastState = broadcastState.NOT_BROADCASTING;

    this._reset(this._connectionState !== connectionState.DISCONNECTED);

    if (this._connectionState === connectionState.DISCONNECTED) {
      return Promise.resolve();
    }

    this._emit(stoppedByClient ? events.BROADCAST_END : events.BROADCAST_STOPPED);
  }

  async _createOffer () {
    const offer = await this._client.createOffer({
      offerToSendAudio: true,
      offerToSendVideo: false,
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });

    this._client.setLocalDescription(offer);

    return offer.sdp.replace('a=sendrecv', 'a=recvonly');
  }

  async _setAnswer (answer) {
    this._client.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp: answer
    }));
  }

  get isConnecting () {
    return this._connectionState === connectionState.CONNECTING;
  }

  get isConnected () {
    return this._connectionState === (connectionState.READY || connectionState.CONNECTED);
  }

  get isReady () {
    return this._connectionState === connectionState.READY;
  }

  get isPaused () {
    return this._broadcastState === broadcastState.PAUSED;
  }

  get isBroadcasting () {
    return this._broadcastState === broadcastState.BROADCASTING;
  }

  get isMuted () {
    return this._muted;
  }

  get slot () {
    return this._slotId > 0 ? this._slotId : undefined;
  }

  get duration () {
    return this._duration / 1000;
  }

  get opts () {
    return this._opts;
  }
}

module.exports = Client;
