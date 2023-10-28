import { Event, StageBroadcastState, StageConnectionState } from '../../constants/index.js';
import events from 'events';
import wrtc from 'wrtc';
import ffmpeg from 'fluent-ffmpeg';
import _ from 'lodash';

const EventEmitter = events.EventEmitter;
const { RTCSessionDescription, RTCPeerConnection, nonstandard } = wrtc;
const { RTCAudioSource } = nonstandard;

const SAMPLE_RATE = 48000;
const SLICE_COUNT = 1920;
const CHANNEL_COUNT = 2;
const BITRATE = 16;
const FRAMES = 480;

class Client extends EventEmitter {
  constructor () {
    super();

    this.slotId = 0;
    this.muted = false;
    this.completed = false;

    this.incompleteSample = null;
    this.samples = [];
    this.emittedPlaying = false;
    this.duration = 0;
    this.volume = 1;

    this.broadcastState = StageBroadcastState.IDLE;
    this.connectionState = StageConnectionState.DISCONNECTED;

    this.pc = new RTCPeerConnection();
    this.source = new RTCAudioSource();
    this.pc.addTrack(this.source.createTrack());

    this.pc.onconnectionstatechange = async () => {
      const state = this.pc.connectionState;

      if (state === StageConnectionState.CONNECTED) {
        if (this.connectionState === StageConnectionState.INITIALISING || this.connectionState === StageConnectionState.DISCONNECTED) {
          this.connectionState = StageConnectionState.CONNECTING;
        } else if (this.connectionState === StageConnectionState.CONNECTING) {
          this.connectionState = StageConnectionState.CONNECTED;
        }
      } else if (state === StageConnectionState.DISCONNECTED) {
        this.connectionState = StageConnectionState.DISCONNECTED;

        return this.reset(true);
      } else { return false; }

      return this.emit(this.connectionState === StageConnectionState.CONNECTED ? Event.STAGE_CLIENT_CONNECTED : this.connectionState === StageConnectionState.CONNECTING, { slotId: this.slotId });
    };
  }

  broadcast () {
    setTimeout(async () => {
      if (this.broadcastState !== StageBroadcastState.PLAYING) {
        return this.broadcast();
      }

      const sample = this.samples?.shift();

      if (sample) {
        this.duration += 10;

        if (!this.muted) {
          this.source.onData(
            {
              samples: new Int8Array(sample).map((samples) => samples * this.volume),
              sampleRate: SAMPLE_RATE,
              bitsPerSample: BITRATE,
              channelCount: CHANNEL_COUNT,
              numberOfFrames: FRAMES,
              timestamp: Date.now()
            }
          );
        }
      }

      if (!this.emittedPlaying) {
        this.emittedPlaying = true;
        this.emit(Event.STAGE_CLIENT_START);
      } else if (!this.samples.length && this.completed) {
        this.emit(Event.STAGE_CLIENT_END);
        this.stop();

        return;
      }

      return this.broadcast();
    }, 9.9);
  }

  handleSlotUpdate (slot, sourceSubscriberId) {
    if (slot.occupierId !== null) {
      if ((this.muted && !slot.occupierMuted) || (!this.muted && slot.occupierMuted)) {
        this.muted = slot.occupierMuted;
        this.emit(slot.occupierMuted ? Event.STAGE_CLIENT_MUTED : Event.STAGE_CLIENT_UNMUTED, { sourceSubscriberId, slotId: this.slotId });
      } else if (slot.locked) {
        this.reset(true);
      } else if (this.connectionState !== StageConnectionState.READY && slot.connectionState === StageConnectionState.CONNECTED.toUpperCase()) {
        this.connectionState = StageConnectionState.READY;
        this.emit(Event.STAGE_CLIENT_READY, { slotId: this.slotId });
      }
    } else {
      this.reset(true);

      this.emit(sourceSubscriberId !== undefined ? Event.STAGE_CLIENT_KICKED : Event.STAGE_CLIENT_DISCONNECTED, { sourceSubscriberId, slotId: this.slotId });
    }
  }

  reset (disconnect = false) {
    this.pc.getSenders()[0].track.stop();

    this.broadcastState = this.broadcastState === StageBroadcastState.PAUSED ? this.broadcastState : StageBroadcastState.IDLE;

    this.ffmpeg?.destroy();
    this.completed = false;
    this.incompleteSample = null;
    this.samples = [];
    this.emittedPlaying = false;
    this.duration = 0;

    if (disconnect) {
      this.connectionState = StageConnectionState.DISCONNECTED;

      this.pc.close();

      this.emit(Event.STAGE_CLIENT_DISCONNECTED);
    }
  }

  setVolume (volume) {
    this.volume = volume;

    return this.volume;
  }

  play (data) {
    this.reset();

    this.ffmpeg = ffmpeg(data)
      .toFormat('wav')
      .native()
      .noVideo()
      .on('error', (error) => {
        data?.destroy();

        if (this.broadcastState === StageBroadcastState.IDLE) { return false; }

        this.reset();

        this.emit(Event.STAGE_CLIENT_ERROR, error);
      })
      .pipe()
      .on('data', async (data) => {
        for (const chunk of _.chunk(data, SLICE_COUNT)) {
          if (this.incompleteSample) {
            const incompleteSample = this.incompleteSample;

            const overflowed = (incompleteSample.length + chunk.length) > SLICE_COUNT ? (incompleteSample.length + chunk.length) - SLICE_COUNT : 0;

            const temp = new Uint8Array(SLICE_COUNT);

            temp.set(new Uint8Array(incompleteSample), 0);
            temp.set(new Uint8Array(overflowed ? chunk.slice(0, SLICE_COUNT - incompleteSample.length) : chunk), incompleteSample.length);

            this.incompleteSample = temp.length < SLICE_COUNT
              ? temp
              : overflowed
                ? chunk.slice(SLICE_COUNT - incompleteSample.length)
                : null;

            if (temp.length !== SLICE_COUNT) {
              continue;
            }

            this.samples.push(temp);
          } else {
            chunk.length === SLICE_COUNT
              ? this.samples.push(chunk)
              : this.incompleteSample = chunk;
          }
        }
      })
      .on('finish', () => { this.completed = true; });

    this.broadcastState = this.broadcastState === StageBroadcastState.PAUSED ? StageBroadcastState.PAUSED : StageBroadcastState.PLAYING;

    this.broadcast();
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
    this.pc.setLocalDescription(
      await this.pc.createOffer(
        {
          offerToSendAudio: true,
          offerToSendVideo: false,
          offerToReceiveAudio: false,
          offerToReceiveVideo: false
        }
      )
    );

    return this.pc.localDescription.sdp;
  }

  async setResponse (slotId, sdp) {
    this.slotId = slotId;

    this.pc.setRemoteDescription(
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
