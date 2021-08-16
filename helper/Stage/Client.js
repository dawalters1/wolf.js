const wrtc = require('wrtc');
const { RTCSessionDescription, RTCPeerConnection } = wrtc;
const { RTCAudioSource } = require('wrtc').nonstandard;
const MediaStream = require('wrtc').MediaStream;

const { request, internal } = require('../../constants');

const ffmpeg = require('fluent-ffmpeg');
const Limiter = require('./Limiter');

const Stream = require('stream');

// #region WRTC

const SAMPLE_RATE = 48000;
const SLICE_COUNT = 1920;// sampleRate / 100;
const CHANNEL_COUNT = 2;
const BITRATE = 16;
const FRAMES = 480;
// #endregion

module.exports = class Client {
  constructor (api, targetGroupId) {
    this._api = api;
    this._targetGroupId = targetGroupId;

    this._slotId = 0;
    this._ready = false;
    this._playing = false;
    this._muted = false;
    this._paused = false;

    this._volume = 1.0;

    this._duration = 0;

    this._client = new RTCPeerConnection();

    this._client.onconnectionstatechange = async () => {
      if (this._client.connectionState === 'connected') {
        if (this._isConnecting) {
          this._emit(internal.STAGE_CLIENT_CONNECTED);

          this._isConnecting = false;

          await this._api.utility().delay(2000);

          this._ready = true;

          return this._emit(internal.STAGE_CLIENT_READY);
        }

        this._isConnecting = true;
      } else if (this._client.connectionState === 'disconnected') {
        this.disconnect();
      }

      return Promise.resolve();
    };

    this._client.ontrack = () => console.log('track');

    this._reset();

    return this._broadcast();
  }

  async _handleSlotUpdate (slot, sourceSubscriberId) {
    if (!slot.occupierId) {
      this._muted = false;
      this._playing = false;
      this._ready = false;
      this._slotId = 0;

      this._reset();

      this._client.close();

      this._emit(internal.STAGE_CLIENT_DISCONNECTED,
        {
          duration: this._duration / 1000,
          sourceSubscriberId: sourceSubscriberId
        });
    } else {
      if (this._muted && !slot.occupierMuted) {
        this._muted = false;
        return this._emit(internal.STAGE_CLIENT_UNMUTED,
          {
            duration: this._duration / 1000,
            sourceSubscriberId: sourceSubscriberId
          });
      } else if (!this._muted && slot.occupierMuted) {
        this._muted = true;

        return this._emit(internal.STAGE_CLIENT_MUTED,
          {
            duration: this._duration / 1000,
            sourceSubscriberId: sourceSubscriberId
          });
      }
    }
  }

  _emit (eventString, data = {}) {
    data.targetGroupId = this._targetGroupId;

    return this._api.on._emit(eventString, data);
  }

  _resetTrack () {
    this._source = new RTCAudioSource();

    this._track = this._source.createTrack();
    const mediaStream = new MediaStream();
    mediaStream.addTrack(this._track);

    if (this._sender === undefined) {
      this._sender = this._client.addTrack(this._track, mediaStream);
    } else {
      this._sender.replaceTrack(this._track);
    }
  }

  _reset () {
    if (this._ffmpegCommand) {
      this._ffmpegCommand = undefined;
      this._ffmpegPipe.destroy();
      this._samples = new Uint8Array(0);
    }

    if (this._downloader) {
      this._downloader.destroy();
    }

    this._duration = 0;
    this._playing = false;
    this._endOfData = false;
    this._samples = new Uint8Array(0);

    return this._resetTrack();
  }

  _converter () {
    this._ffmpegCommand = ffmpeg(this._downloader)
      .toFormat('wav')
      .native()
      .noVideo()
      .on('error', (error) => {
        this._downloader.destroy();

        if (this._ffmpegCommand === undefined) {
          return;
        }
        this._emit(internal.STAGE_CLIENT_ERROR, error);
      });

    this._ffmpegPipe = this._ffmpegCommand.pipe();

    /* Issue: FFMPEG cannot reliably be paused & resumed - It floods the samples and without a delay it leads to audio issues
   Solutions:

   1. 10MS delay -> This works, but leads to choppy issues broadcasting normally, and massive choppiness when paused for a long time
   2. Limiter -> Basically handles all the data from the pipe, can be paused and resumed while still processing data and only send the 1920 chunk at a time

   Using the terrible limiter solution.
   */
    this._limiter = new Limiter(this._ffmpegPipe, SLICE_COUNT);

    this._limiter
      .on('data', (samples) => {
        const newSamples = new Int8Array(samples);
        const mergedSamples = new Int8Array(this._samples.length + newSamples.length);
        mergedSamples.set(this._samples);
        mergedSamples.set(newSamples, this._samples.length);
        this._samples = mergedSamples;
        this._playing = true;
      })
      .on('finish', () => {
        this._reset();

        console.log('ended');
        this._emit(
          internal.STAGE_CLIENT_BROADCAST_ENDED,
          {
            targetGroupId: this._targetGroupId
          });
      });
  }

  _broadcast () {
    const broadcast = async () => {
      if (!this._ready) {
        return;
      }

      if (this._samples.length < SLICE_COUNT) {
        if (!this._endOfData) {
          return;
        }

        this._reset();

        this._emit(
          internal.STAGE_CLIENT_BROADCAST_ENDED,
          {
            targetGroupId: this._targetGroupId
          });

        return;
      }

      const sampleSlice = this._samples.slice(0, SLICE_COUNT);
      this._samples = this._samples.slice(SLICE_COUNT);

      this._duration += 10;

      if (this._muted) {
        return;
      }

      this._source.onData({
        samples: sampleSlice,
        sampleRate: SAMPLE_RATE,
        bitsPerSample: BITRATE,
        channelCount: CHANNEL_COUNT,
        numberOfFrames: FRAMES
      });
    };

    (async function repeat () {
      await broadcast();
      setImmediate(repeat);
    })();
  }

  async play (data) {
    if (this._slotId === 0) {
      throw new Error('bot does not occupy a slot in this group');
    }

    if (!this._ready) {
      throw new Error('bot has joined stage, but is not ready to broadcast, try again in a few moments');
    }

    if (!data) {
      throw new Error('data cannot be null or empty');
    }

    if (!(data instanceof Stream.Stream) || !typeof (data._read === 'function') || !typeof (data._readableState === 'object')) {
      throw new Error('stream must be instance of readable');
    }

    this._reset();

    this._downloader = data;

    this._converter();
  };

  async stop () {
    this._reset();

    return this._emit(internal.STAGE_CLIENT_STOPPED,
      {
        targetGroupId: this._targetGroupId
      });
  };

  async pause () {
    this._paused = true;

    this._limiter.pause();

    this._track.enabled = false;

    this._emit(
      internal.STAGE_CLIENT_PAUSED,
      {
        targetGroupId: this._targetGroupId,
        duration: this._duration / 1000
      });

    return this._duration / 1000;
  };

  async unpause () {
    this._paused = false;

    this._limiter.resume();

    this._track.enabled = true;

    this._emit(
      internal.STAGE_CLIENT_UNPAUSED,
      {
        targetGroupId: this._targetGroupId,
        duration: this._duration / 1000
      });
    return this._duration / 1000;
  };

  async joinSlot (slotId) {
    if (this._slotId !== 0) {
      throw new Error('bot already occupies a slot in this group');
    }

    const offer = await this._client.createOffer({
      offerToSendAudio: true,
      offerToSendVideo: false,
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });

    const offerSdp = offer.sdp.replace('a=sendrecv', 'a=recvonly');

    this._client.setLocalDescription(offer);

    const result = await this._api.websocket.emit(request.GROUP_AUDIO_BROADCAST,
      {
        id: this._targetGroupId,
        slotId,
        sdp: offerSdp
      });

    if (result.success) {
      const { slot, sdp } = result.body;

      this._slotId = slot.id;

      this._client.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp
      }));

      return slot;
    }

    throw new Error(result.headers ? result.headers.message : 'Unable to join slot\nReason: Unknown');
  };

  async disconnect () {
    this._reset();

    clearInterval(this._broadcaster);

    this._client.close();

    if (this._slotId > 0) {
      try {
        await this._api.websocket.emit(request.GROUP_AUDIO_BROADCAST_DISCONNECT, {
          id: this._targetGroupId,
          slotId: this._slotId,
          occupierId: this._api.currentSubscriber.id
        });
      } catch (error) {

      }
      this._slotId = 0;
    }

    return Promise.resolve();
  }

  /**
   * @returns {Boolean} Whether or not the client has connected to a slot and is ready to broadcast
   */
  async isReady () {
    return this._ready;
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
    return this._slotId !== 0;
  }

  async isConnecting () {
    return this._isConnecting;
  }

  /**
     * @returns {Number} The group ID linked to the client
     */
  get targetGroupId () {
    return this._targetGroupId;
  }

  /**
     * @returns {Number} How many seconds of audio have been broadcasted
     */
  async duration () {
    return this._duration / 1000;
  }
};