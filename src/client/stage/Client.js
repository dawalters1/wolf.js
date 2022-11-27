const EventEmitter = require('events').EventEmitter;
const wrtc = require('wrtc');
const { RTCSessionDescription, RTCPeerConnection } = wrtc;
const { RTCAudioSource } = require('wrtc').nonstandard;
const MediaStream = require('wrtc').MediaStream;
const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');

const { connectionState, broadcastState, events } = require('./constants');

const SAMPLE_RATE = 48000;
const SLICE_COUNT = 1920;
const CHANNEL_COUNT = 2;
const BITRATE = 16;
const FRAMES = 480;

const createUInt8Array = (buffer) => {
  const sample = new Int8Array(1920);

  sample.set(buffer);

  if (buffer.byteLength < SLICE_COUNT) {
    sample.fill(0, buffer.byteLength);
  }

  return sample;
};

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
    this._volume = 1;
    this._emittedPlaying = false;
    this._source = new RTCAudioSource();
    const stream = new MediaStream();
    this._track = this._source.createTrack();
    stream.addTrack(this._track);

    this._sender = this._client.addTrack(this._track, stream);

    this.durationUpdater = setInterval(() => {
      if (this._broadcastState === broadcastState.BROADCASTING) {
        this._duration += 1000;
        this._emit(events.BROADCAST_DURATION, this._duration);

        if (this._duration === 1000) {
          this._emit(events.BROADCAST_START);
        }
      }
    }, 1000);

    const broadcast = () => setImmediate(async () => {
      if (this._broadcastState !== broadcastState.BROADCASTING) {
        return broadcast();
      }

      const sample = this._samples?.shift();

      if (sample) {
        if (!this._muted) {
          this._source.onData(
            {
              samples: sample.map((samples) => samples * this._volume.toFixed(2)), // This works to adjust volume, but causes static at lower volumes
              sampleRate: SAMPLE_RATE,
              bitsPerSample: BITRATE,
              channelCount: CHANNEL_COUNT,
              numberOfFrames: FRAMES
            }
          );
        }
      }

      if (!this._samples.length) {
        if (this._downloadComplete) {
          return this.stop(true);
        }
      }

      return broadcast();
    });

    this._downloadComplete = false;

    this._client.onconnectionstatechange = async () => {
      if (this._client.connectionState === 'connected') {
        if (this._connectionState === connectionState.UNINITIALIZED || this._connectionState === connectionState.DISCONNECTED) {
          this._connectionState = connectionState.CONNECTING;
          this._emit(events.CONNECTING);
        } else if (this._connectionState === connectionState.CONNECTING) {
          this._connectionState = connectionState.CONNECTED;
        }
      } else if (this._client.connectionState === 'disconnected') {
        this._connectionState = connectionState.DISCONNECTED;

        this._reset(true);

        this._emit(events.DISCONNECTED);
      }

      return Promise.resolve();
    };

    broadcast();
  }

  _reset (disconnect = false) {
    if (this._ffmpeg) {
      this._ffmpeg.destroy();
    }

    this._samples = [];
    this._duration = 0;
    this._emittedPlaying = false;

    this._downloadComplete = false;

    if (disconnect) {
      this._client.close();
    }
  }

  _emit (command, data = {}) {
    this.emit(
      command,
      {
        ...data,
        client: this,
        duration: this.duration,
        slotId: this._slotId
      }
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
      } else if (this._connectionState !== connectionState.READY && slot.connectionState === 'CONNECTED') {
        this._connectionState = connectionState.READY;
        this.emit(events.READY);
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
    this._reset();

    this._ffmpeg = ffmpeg(data)
      .toFormat('wav')
      .native()
      .noVideo()
      .withOptions(this._opts)
      .on('error', error => {
        if (typeof data.destory === 'function') {
          data.destroy();
        }

        if (this._broadcastState !== broadcastState.BROADCASTING) {
          return Promise.resolve();
        }

        this._emit(events.BROADCAST_ERROR, error);
      })
      .pipe()
      .on('data', (data) => this._samples.push(..._.chunk(data, SLICE_COUNT).map((sampleChunk) => createUInt8Array(sampleChunk))))
      .on('finish', () => {
        this._downloadComplete = true;
      });

    this._broadcastState = this._broadcastState === broadcastState.PAUSED ? broadcastState.PAUSED : broadcastState.BROADCASTING;
  }

  async pause () {
    this._broadcastState = broadcastState.PAUSED;

    this._emit(events.BROADCAST_PAUSED);

    return this.duration;
  }

  async resume () {
    this._broadcastState = this._samples.length > 0 ? broadcastState.BROADCASTING : broadcastState.NOT_BROADCASTING;

    this._emit(events.BROADCAST_RESUME);

    return this.duration;
  }

  async setVolume (value) {
    this._volume = value;

    return Promise.resolve();
  }

  async disconnect () {
    this._reset(true);
    return Promise.resolve();
  }

  async stop (stoppedByClient = false) {
    if (this._broadcastState === broadcastState.NOT_BROADCASTING) {
      return Promise.resolve();
    }

    this._broadcastState = broadcastState.NOT_BROADCASTING;

    this._reset();

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

  get volume () {
    return this._volume;
  }
}

module.exports = Client;
