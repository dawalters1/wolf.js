/* eslint-disable no-unused-vars */
import { Event, StageBroadcastState, StageConnectionState } from '../../constants/index.js';
import events from 'events';
import wrtc from 'wrtc';
import ffmpeg from 'fluent-ffmpeg';
import { nanoid } from 'nanoid';

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

    this.slotId = undefined;
    this.muted = undefined;

    this.broadcastState = StageBroadcastState.IDLE;
    this.connectionState = StageConnectionState.DISCONNECTED;
    this.client = new RTCPeerConnection();
    this.source = new RTCAudioSource();
    this.completed = false;
    this.duration = 0;

    const stream = new MediaStream();

    this.track = this.source.createTrack();
    stream.addTrack(this.track);
    this.sender = this.client.addTrack(this.track, stream);
  }

  reset () {

  }

  get samples () {
    return this._samples;
  }

  set samples (value) {
    this._samples = value;

    if (this._samples.length > (SLICE_COUNT * 2) && !this.ffmpeg.isPaused()) {
      this.ffmpeg.pause();
    } else if (this.ffmpeg.isPaused()) {
      this.ffmpeg.resume();
    }
  }

  play (data) {
    const id = nanoid();

    this.songId = nanoid();

    this.ffmpeg = ffmpeg(data)
      .toFormat('wav')
      .native()
      .noVideo()
      .on('error', (error) => {
        if (this.broadcastState === StageBroadcastState.IDLE) {
          return Promise.resolve();
        }

        this.emit(Event.STAGE_CLIENT_ERROR, error);
      })
      .pipe()
      .on('data', (data) => {

      })
      .on('finish', () => { this.completed = true; });

    this.broadcastState = StageBroadcastState.PLAYING;
  }

  stop () {
    this.reset();
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
