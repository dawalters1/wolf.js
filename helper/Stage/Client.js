const wrtc = require('wrtc');
const { RTCSessionDescription, RTCPeerConnection } = wrtc;
const { RTCAudioSource } = require('wrtc').nonstandard;
const MediaStream = require('wrtc').MediaStream;

const { request, internal } = require('../../constants');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegUtil = require('fluent-ffmpeg-util');

const stream = require('stream');

// #region WRTC

const SAMPLE_RATE = 48000;
const BITS_PER_SAMPLE = 16;
const CHANNEL_COUNT = 2;
const NUMBER_OF_FRAMES = SAMPLE_RATE / 100;
const SLIZE_SIZE = 1920;

// #endregion

const signal = {
  PAUSE: 'SIGSTOP',
  RESUME: 'SIGCONT',
  ABORT: 'SIGKILL'
};

module.exports = class Client {
  constructor (api, groupId) {
    this._api = api;

    this._groupId = groupId;
    this._slotId = 0;

    this._playing = false;
    this._muted = false;
    this._paused = false;
    this._ready = false;

    return this._init();
  }

  // #region  Private

  _init () {
    this._client = new RTCPeerConnection();
    this._source = new RTCAudioSource();
    this._samples = new Uint8Array(0);

    const track = this._source.createTrack();
    const mediaStream = new MediaStream();
    mediaStream.addTrack(track);

    this._sender = this._client.addTrack(track, mediaStream);

    const onData = async () => {
      if (this._playing) {
        if (!this._paused) {
          if (this._samples.length >= SLIZE_SIZE) {
            if (!this._muted) {
              await this._source.onData({
                samples: this._samples.slice(0, SLIZE_SIZE),
                sampleRate: SAMPLE_RATE,
                bitsPerSample: BITS_PER_SAMPLE,
                channelCount: CHANNEL_COUNT,
                numberOfFrames: NUMBER_OF_FRAMES
              });
            }

            this._duration += 10;

            this._samples = this._samples.slice(SLIZE_SIZE);
          } else {
            if ((this._ffmpeg && !this._ffmpeg.ffmpegProc)) {
              this._ffmpegSignal(signal.ABORT);

              return this._api.on._emit(internal.STAGE_CLIENT_BROADCAST_ENDED,
                {
                  groupId: this._groupId
                });
            }
          }
        }
      }
    };

    (function repeat () {
      onData();
      setTimeout(repeat);
    })();
  }

  async _handleSlotUpdate (slot) {
    if (!this._slotId) {
      return Promise.resolve();
    }

    if (!slot.occupierId) {
      this._muted = false;
      this._playing = false;
      this._ready = false;
      this._slotId = 0;

      this._api.on._emit(internal.STAGE_CLIENT_DISCONNECTED,
        {
          groupId: this._groupId,
          duration: this._duration / 1000,
          sourceSubscriberId: slot.sourceSubscriberId
        });

      this._ffmpegSignal(signal.ABORT);
    } else {
      if (!this._ready && slot.connectionState === 'CONNECTED') {
        this._api.on._emit(internal.STAGE_CLIENT_CONNECTED,
          {
            groupId: this._groupId
          });

        await this._api.utility().delay(4000);

        this._ready = true;

        this._api.on._emit(internal.STAGE_CLIENT_READY,
          {
            groupId: this._groupId
          });
      } else {
        if (this._muted && !slot.occupierMuted) {
          this._muted = false;
          return this._api.on._emit(internal.STAGE_CLIENT_UNMUTED,
            {
              groupId: this._groupId,
              duration: this._duration / 1000,
              sourceSubscriberId: slot.sourceSubscriberId
            });
        } else if (!this._muted && slot.occupierMuted) {
          this._muted = true;

          return this.emit(event.MUTED,
            {
              groupId: this._groupId,
              duration: this._duration / 1000,
              sourceSubscriberId: slot.sourceSubscriberId
            });
        }
      }
    }
  }

  /**
  * Convert the readableStream into .wav and broadcast it
  * @param {stream.Readable} readableStream - The data
  * @param {Number} startAt - Start at
  */
  _convertAndBroadcast (readableStream) {
    this._stream = readableStream;

    this._ffmpeg = ffmpeg(this._stream)
      .toFormat('wav')
      // .withAudioChannels(2)
    // .withAudioQuality(0)
    //  .withAudioFrequency(48000)
    //    .withAudioBitrate(192)
      // .addOutputOption('-page_duration 10')
      // .audioCodec('pcm-mulaw')
      .native()
      .noVideo()
      .on('error', error => {
        if (this._ready) {
          if (this._playing) {
            this._api.on._emit(internal.STAGE_CLIENT_ERROR,
              {
                groupId: this._groupId,
                error
              });
          }
        }

        this._ffmpegSignal(signal.ABORT);
      });

    const ffstream = this._ffmpeg.pipe();

    ffstream.on('data', (buffer) => {
      const newSamples = new Int8Array(buffer);
      const mergedSamples = new Int8Array(this._samples.length + newSamples.length);
      mergedSamples.set(this._samples);
      mergedSamples.set(newSamples, this._samples.length);
      this._samples = mergedSamples;

      this._playing = true;
    });

    //   const fromBuffer = new Uint8Array(chunk);
    //  const newSamples = new Uint8Array(this._samples.length + fromBuffer.length);
    // newSamples.set(this._samples);
    // newSamples.set(fromBuffer, this._samples.length);
    // this._samples = newSamples;

    // this._playing = true;
    // });
  }

  /**
  * Update ffmpeg state (ABORT, PAUSE, RESUME)
  * @param {string} sig - The signal
  * @returns Promise.resolve()
  */
  async _ffmpegSignal (sig) {
    switch (sig) {
      case signal.ABORT:
        this._playing = false;
        if (this._ffmpeg !== undefined) {
          ffmpegUtil.pause(this._ffmpeg); // Using pause because abort doesnt always work.

          this._source = new RTCAudioSource();
          const track = this._source.createTrack();
          const mediaStream = new MediaStream();
          mediaStream.addTrack(track);

          this._sender.replaceTrack(this._source.createTrack());
        }

        if (this._stream) {
          this._stream.destroy();
        }

        this._samples = new Uint8Array(0);
        this._ffmpeg = undefined;
        this._duration = 0;

        break;

      case signal.PAUSE:
        this._paused = true;
        if (this._ffmpeg !== undefined) {
          ffmpegUtil.pause(this._ffmpeg);
        }
        break;

      case signal.RESUME:
        this._paused = false;
        if (this._ffmpeg !== undefined) {
          ffmpegUtil.resume(this._ffmpeg);
        }
        break;
    }

    return Promise.resolve();
  }

  // #endregion

  /**
  * Play audio on stage
  * @param {stream.Readable} readableStream - stream containing audio data
  * @param {Number} startAt - where at in the stream to startAt
  * @returns Promise.resolve()
  */
  async play (readableStream) {
    if (!this._ready || this._slotId === 0) {
      throw new Error(this._slotId > 0 ? 'client is currently connecting to stage' : 'client has not joined stage');
    }

    if (!readableStream) {
      throw new Error('stream cannot be null or empty');
    } else if (!(readableStream instanceof stream.Stream) || !typeof (readableStream._read === 'function') || !typeof (readableStream._readableState === 'object')) {
      throw new Error('stream must be readable type');
    }

    await this._ffmpegSignal(signal.ABORT);

    this._convertAndBroadcast(readableStream);

    return Promise.resolve();
  }

  /**
  * Pauses the current broadcast
  * @returns {Number} - The duration where song is paused
  */
  async pause () {
    await this._ffmpegSignal(signal.PAUSE);

    this._api.on._emit(internal.STAGE_CLIENT_PAUSED,
      {
        groupId: this._groupId,
        duration: this._duration / 1000
      });

    return this._duration / 1000;
  }

  /**
  * Unpauses the current broadcast
  * @returns Promise.resolve()
  */
  async unpause () {
    await this._ffmpegSignal(signal.RESUME);

    this._api.on._emit(internal.STAGE_CLIENT_UNPAUSED,
      {
        groupId: this._groupId,

        duration: this._duration / 1000
      });

    return this._duration / 1000;
  }

  /**
  * Stops the current broadcast
  * @returns Promise.resolve()
  */
  async stop () {
    const duration = this._duration;

    await this._ffmpegSignal(signal.ABORT);

    this._api.on._emit(internal.STAGE_CLIENT_STOPPED,
      {
        groupId: this._groupId,

        duration: duration / 1000
      });

    return this._duration / 1000;
  }

  /**
  * Join a specific slot in the group
  * @param {Number} slotId - The id of the slot to join
  * @returns {{id: Number, locked: Boolean, occupierId: Number, occupierMuted: Boolean, uuid: String, connectionState: string}} slot - Information about the slot joined
  */
  async joinSlot (slotId) {
    if (this._slotId > 0) {
      throw new Error(`Already joined Slot ${this._slotId}`);
    }

    this._isConnecting = true;

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
        id: this._groupId,
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

      this._isConnecting = false;

      return slot;
    }

    this._isConnecting = false;

    throw new Error(result.headers ? result.headers.message : 'Unable to join slot\nReason: Unknown');
  }

  /**
  * Leave the occupied slot
  * @returns Promise.resolve()
  */
  async leaveSlot () {
    if (!this._slotId) {
      throw new Error('client has not joined stage');
    }

    // Reset slotId to ignore events
    this._slotId = 0;

    // Stop the broadcaster
    clearInterval(this._broadcaster);

    // Kill the ffmpeg
    this._ffmpegSignal(signal.ABORT);

    await this._api.websocket.emit(request.GROUP_AUDIO_BROADCAST_DISCONNECT, {
      id: this._groupId,
      slotId: this._slotId,
      occupierId: this._api.currentSubscriber.id
    });

    // Close the client
    return this._client.close();
  }

  // #region  Getters

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
   * @returns {Number} How many seconds of audio have been broadcasted
   */
  async duration () {
    return this._duration / 1000;
  }

  // #endregion
};
