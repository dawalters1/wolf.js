/* eslint-disable no-unused-vars */
import { Event, StageBroadcastState, StageConnectionState } from '../../constants/index.js';
import events from 'events';
import wrtc from 'wrtc';
import ffmpeg from 'fluent-ffmpeg';
import { setDriftlessTimeout } from 'driftless';
import _ from 'lodash';

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

const createUInt8Array = (buffer) => {
  const sample = new Int8Array(1920);

  sample.set(buffer);

  if (buffer.length < SLICE_COUNT) {
    sample.fill(0, buffer.byteLength);
  }

  return sample;
};

class Client extends EventEmitter {
  constructor (client) {
    super();

    this.client = client;

    this.slotId = undefined;
    this.muted = undefined;

    this.broadcastState = StageBroadcastState.IDLE;
    this.connectionState = StageConnectionState.DISCONNECTED;
    this.client = new RTCPeerConnection();
    this.source = new RTCAudioSource();
    this.completed = false;
    this.samples = [];
    this.emittedPlaying = false;
    this.duration = 10;

    const stream = new MediaStream();

    this.track = this.source.createTrack();
    stream.addTrack(this.track);
    this.sender = this.client.addTrack(this.track, stream);

    const onFirstBroadcast = () => {
      this.emittedPlaying = true;

      this.durationUpdater = setInterval(() => {
        if (this.broadcastState === StageBroadcastState.PLAYING) {
          this.duration += 10;

          if (this.duration % 1000 === 0) {
            this.emit(Event.STAGE_CLIENT_DURATION, { duration: this.duration });
          }
        }
      }, 10);
      this.emit(Event.STAGE_CLIENT_START);
    };

    const broadcast = () => setImmediate(() => {
      if (this.broadcastState === StageBroadcastState.PLAYING) {
        if (!this.emittedPlaying) {
          onFirstBroadcast();
        }

        const sample = this.samples?.shift();

        if (sample) {
          if (!this.muted) {
            this.source.onData(
              {
                samples: sample,
                sampleRate: SAMPLE_RATE,
                bitsPerSample: BITRATE,
                channelCount: CHANNEL_COUNT,
                numberOfFrames: FRAMES
              }
            );
          }
        }

        if (!this.samples.length) {
          if (this.completed) {
            this.emit(Event.STAGE_CLIENT_END);
            this.stop();
          }
        }
      }

      return broadcast();
    });

    this.client.onconnectionstatechange = async () => {
      const state = this.client.connectionState;

      if (state === StageConnectionState.CONNECTED) {
        if (this.connectionState === StageConnectionState.INITIALISING || this.connectionState === StageConnectionState.DISCONNECTED) {
          this.connectionState = StageConnectionState.CONNECTING;
        } else if (this.connectionState === StageConnectionState.CONNECTING) {
          this.connectionState = StageConnectionState.CONNECTED;
        }
      } else if (this.client.connectionState === StageConnectionState.DISCONNECTED) {
        this.connectionState = StageConnectionState.DISCONNECTED;

        return this.reset(true);
      } else {
        return Promise.resolve();
      }

      return this.emit(this.connectionState === StageConnectionState.CONNECTED ? Event.STAGE_CLIENT_CONNECTED : this.connectionState === StageConnectionState.CONNECTING);
    };

    broadcast();
  }

  handleSlotUpdate (slot, sourceSubscriberId) {
    if (slot.occupierId !== null) {
      if ((this.muted && !slot.occupierMuted) || (!this.muted && slot.occupierMuted)) {
        this.muted = slot.occupierMuted;
        this.emit(slot.occupierMuted ? Event.STAGE_CLIENT_MUTED : Event.STAGE_CLIENT_UNMUTED, { sourceSubscriberId });
      } else if (slot.locked) {
        this.reset(true);
      } else if (this.connectionState !== StageConnectionState.READY && slot.connectionState === 'CONNECTED') {
        this.connectionState = StageConnectionState.READY;
        this.emit(Event.STAGE_CLIENT_READY);
      }
    } else {
      this.reset(true);

      this.emit(sourceSubscriberId !== undefined ? Event.STAGE_CLIENT_KICKED : Event.STAGE_CLIENT_DISCONNECTED, { sourceSubscriberId });
    }
  }

  reset (disconnect = false) {
    this.ffmpeg?.destroy();
    this.completed = false;
    this.samples = [];
    this.emittedPlaying = false;
    this.duration = 0;
    clearInterval(this.durationUpdater);
    this.broadcastState = StageBroadcastState.PAUSED ? this.broadcastState : StageBroadcastState.IDLE;

    if (disconnect) {
      this.connectionState = StageConnectionState.DISCONNECTED;

      this.client.close();

      this.emit(Event.STAGE_CLIENT_DISCONNECTED);
    }
  }

  play (data) {
    this.reset();

    this.ffmpeg = ffmpeg(data)
      .toFormat('wav')
      .native()
      .noVideo()
      .on('error', (error) => {
        if (this.broadcastState === StageBroadcastState.IDLE) {
          return Promise.resolve();
        }

        this.reset();

        this.emit(Event.STAGE_CLIENT_ERROR, error);
      })
      .pipe()
      .on('data', (data) => this.samples.push(..._.chunk(data, SLICE_COUNT).map((sampleChunk) => createUInt8Array(sampleChunk))))
      .on('finish', () => { this.completed = true; });

    this.broadcastState = this.broadcastState === StageBroadcastState.PAUSED ? StageBroadcastState.PAUSED : StageBroadcastState.PLAYING;
  }

  stop () {
    this.reset();

    return this.emit(Event.STAGE_CLIENT_STOPPED);
  }

  pause () {
    this.broadcastState = StageBroadcastState.PAUSED;
  }

  resume () {
    this.broadcastState = this.ffmpeg ? StageBroadcastState.PLAYING : StageBroadcastState.IDLE;
  }

  async createSDP () {
    const offer = await this.client.createOffer({
      offerToSendAudio: true,
      offerToSendVideo: false,
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });

    this.client.setLocalDescription(offer);

    return offer.sdp.replace('a=sendrecv', 'a=recvonly');
  }

  async setResponse (slotId, sdp) {
    this.slotId = slotId;

    this.client.setRemoteDescription(
      new RTCSessionDescription(
        {
          type: 'answer',
          sdp
        }
      )
    );
  }
}

export default Client;
