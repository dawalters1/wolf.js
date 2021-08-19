const wrtc = require('wrtc');
const { RTCSessionDescription, RTCPeerConnection } = wrtc;
const { RTCAudioSource } = require('wrtc').nonstandard;
const MediaStream = require('wrtc').MediaStream;

const EventEmitter = require('events').EventEmitter;

const { event, state } = require('./constants');

const ffmpeg = require('fluent-ffmpeg');

// #region WRTC

const SAMPLE_RATE = 48000;
const SLICE_COUNT = 1920;// sampleRate / 100;
const CHANNEL_COUNT = 2;
const BITRATE = 16;
const FRAMES = 480;

// #endregion

const delay = async (duration) => new Promise(resolve => {
  setTimeout(resolve, duration);
});

class WRTCWrapper {
  constructor () {
    this._em = new EventEmitter();

    this._playing = false;
    this._paused = false;
    this._muted = false;
    this._connectionState = state.DISCONNECTED;

    this._chunks = [];
    this._duration = 0;
    this._endOfData = false;

    return this._init();
  }
  // #region Private

  _init () {
    this._client = new RTCPeerConnection();

    this._client.onconnectionstatechange = async () => {
      if (this._client.connectionState === 'connected') {
        if (this._connectionState === state.CONNECTING) {
          this._connectionState = state.CONNECTED;

          await delay(2000);

          this._connectionState = state.READY;

          this._em.emit(event.READY, {});

          return;
        }

        this._connectionState = state.CONNECTING;
      } else if (this._client.connectionState === 'disconnected') {
        this._connectionState = state.DISCONNECTED;

        if (this._broadcaster) {
          clearInterval(this._broadcaster);
        }

        this._reset();

        this._client.close();

        this._em.emit(event.DISCONNECTED, this._getData());
      }

      return Promise.resolve();
    };

    this._source = new RTCAudioSource();

    this._track = this._source.createTrack();
    const mediaStream = new MediaStream();
    mediaStream.addTrack(this._track);

    this._sender = this._client.addTrack(this._track, mediaStream);
  }

  _resetTrack () {
    this._source = new RTCAudioSource();

    this._track = this._source.createTrack();
    const mediaStream = new MediaStream();
    mediaStream.addTrack(this._track);

    this._sender.replaceTrack(this._track);
  }

  _getData (sourceSubscriberId = undefined) {
    return {
      slotId: this._slotId,
      duration: this._duration / 1000,
      sourceSubscriberId: sourceSubscriberId
    };
  }

  _reset () {
    if (this._ffmpeg) {
      this._ffmpeg.destroy();
    }

    this._duration = 0;
    this._playing = false;
    this._endOfData = false;

    this._resetTrack();
  }

  async _broadcast () {
    if (this._chunks.length === 0) {
      if (!this._endOfData) {
        return Promise.resolve();
      }

      clearInterval(this._broadcaster);

      this._reset();

      this._em.emit(event.END, {});

      return Promise.resolve();
    }

    const data = this._chunks.shift();

    if (!this._muted) {
      await this._source.onData(data);
    }

    this._duration += 10;

    if (this._duration % 1000 === 0) {
      this._em.emit(event.DURATION, this._getData());
    }

    return Promise.resolve();
  }

  // #endregion

  // #region Public

  handleSlotUpdate (slot, sourceSubscriberId) {
    if (slot.occupierId !== null) {
      if (this._muted && !slot.occupierMuted) {
        this._muted = false;
        return this._em.emit(event.UNMUTED, this._getData(sourceSubscriberId));
      } else if (!this._muted && slot.occupierMuted) {
        this._muted = true;
        return this._em.emit(event.MUTED, this._getData(sourceSubscriberId));
      } else if (!slot.locked) {
        return Promise.resolve();
      }
    }

    this._connectionState = state.DISCONNECTED;

    if (this._broadcaster) {
      clearInterval(this._broadcaster);
    }

    this._reset();

    this._client.close();

    this._em.emit(sourceSubscriberId !== undefined ? event.KICKED : event.DISCONNECTED, this._getData(sourceSubscriberId));
  }

  broadcast (data) {
    this._downloader = data;

    this._chunks = [];

    let _samples = new Uint8Array(0);

    if (!this._paused) {
      this._broadcaster = setInterval(() => this._broadcast(), 9.9);
    }
    this._ffmpeg = ffmpeg(this._downloader)
      .toFormat('wav')
      .native()
      .noVideo()
      .on('error', (error) => {
        this._downloader.destroy();

        if (this._ffmpeg === undefined) {
          return;
        }

        this._em.emit(event.ERROR, { error });
      })
      .pipe()
      .on('data', (chunk) => {
        const newSamples = new Int8Array(chunk);
        const mergedSamples = new Int8Array(_samples.length + newSamples.length);
        mergedSamples.set(_samples);
        mergedSamples.set(newSamples, _samples.length);
        _samples = mergedSamples;

        while (_samples.length > SLICE_COUNT) {
          this._chunks.push({
            samples: _samples.slice(0, SLICE_COUNT),
            sampleRate: SAMPLE_RATE,
            bitsPerSample: BITRATE,
            channelCount: CHANNEL_COUNT,
            numberOfFrames: FRAMES
          });

          _samples = _samples.slice(SLICE_COUNT);
        }

        this._playing = true;
      })
      .on('finish', () => {
        this._endOfData = true;
      });
  }

  stop () {
    this._playing = false;

    if (this._broadcaster) {
      clearInterval(this._broadcaster);
    }
    this._reset();

    this._em.emit(event.STOP, this._getData());

    return this.duration();
  }

  pause () {
    this._paused = true;

    if (this._broadcaster) {
      clearInterval(this._broadcaster);
    }
    this._em.emit(event.PAUSED, this._getData());

    return this.duration();
  }

  resume () {
    this._paused = false;

    this._broadcaster = setInterval(() => this._broadcast(), 9.9);

    this._em.emit(event.RESUME, this._getData());

    return this.duration();
  }

  async createOffer () {
    const offer = await this._client.createOffer({
      offerToSendAudio: true,
      offerToSendVideo: false,
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });

    this._client.setLocalDescription(offer);

    return offer.sdp.replace('a=sendrecv', 'a=recvonly');
  }

  setAnswer (answer) {
    this._client.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp: answer
    }));
  }

  disconnect () {
    this._connectionState = state.DISCONNECTED;

    if (this._broadcaster) {
      clearInterval(this._broadcaster);
    }

    this._reset();

    this._client.close();
  }

  // #region

  // #region Getters

  /**
    * @returns {Boolean} Whether or not the client has connected to a slot and is ready to broadcast
    */
  async isReady () {
    return this._connectionState === state.READY;
  }

  /**
    * @returns {Boolean} Whether or not the clients broadcast has been paused
    */
  async isPaused () {
    return this._paused;
  }

  /**
    * @returns {Boolean} Whether or not the client has been muted on stage
    */
  async isMuted () {
    return this._muted;
  }

  /**
    * @returns {Boolean} Whether or not the client is broadcasting data
    */
  async isPlaying () {
    return this._playing;
  }

  /**
    * @returns {Boolean} Whether or not the client has connected to a slot
    */
  async isConnected () {
    return this._connectionState === state.CONNECTED;
  }

  async isConnecting () {
    return this._connectionState === state.CONNECTING;
  }

  /**
    * @returns {Number} How many seconds of audio have been broadcasted
    */
  async duration () {
    return this._duration / 1000;
  }

  // #endregion

  // #region  Events

  onEnd (fn) { this._em.on(event.END, fn); }
  onDuration (fn) { this._em.on(event.DURATION, fn); }
  onStop (fn) { this._em.on(event.STOP, fn); }
  onError (fn) { this._em.on(event.ERROR, fn); }
  onConnecting (fn) { this._em.on(event.CONNECTING, fn); };
  onConnected (fn) { this._em.on(event.CONNECTED, fn); }
  onKicked (fn) { this._em.on(event.KICKED, fn); }
  onMuted (fn) { this._em.on(event.MUTED, fn); }
  onUnmuted (fn) { this._em.on(event.UNMUTED, fn); }
  onDisconnected (fn) { this._em.on(event.DISCONNECTED, fn); };
  onReady (fn) { this._em.on(event.READY, fn); }
  onPaused (fn) { this._em.on(event.PAUSED, fn); }
  onResume (fn) { this._em.on(event.RESUME, fn); }

  // #endregion
}

module.exports = WRTCWrapper;
