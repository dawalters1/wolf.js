import { Event, StageBroadcastState, StageConnectionState } from '../../constants/index.js';
import events from 'events';
import wrtc from 'wrtc';
import ffmpeg from 'fluent-ffmpeg';
import _ from 'lodash';
import { Stream } from 'stream';

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

      return this.emit(
        this.connectionState === StageConnectionState.CONNECTED
          ? Event.STAGE_CLIENT_CONNECTED
          : this.connectionState === StageConnectionState.CONNECTING,
        {
          slotId: this.slotId
        }
      );
    };
  }

  broadcast () {
    setTimeout(async () => {
      if (this.broadcastState !== StageBroadcastState.PLAYING) {
        return this.broadcast();
      }

      const sample = this.samples?.shift();

      if (sample && !this.muted) {
        this.source.onData(
          {
            samples: sample.map((samples) => this.volume === 1 ? samples : samples * this.volume),
            sampleRate: SAMPLE_RATE,
            bitsPerSample: BITRATE,
            channelCount: CHANNEL_COUNT,
            numberOfFrames: FRAMES
          }
        );
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
    this.pc?.getSenders()[0]?.track?.stop();

    this.broadcastState = this.broadcastState === StageBroadcastState.PAUSED ? this.broadcastState : StageBroadcastState.IDLE;

    clearInterval(this.broadcastTimeUpdater);

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

    /**
     * Create the appropriate FFMPEG instance
     * ~ If it is a stream using .native will provide the best in-sync audio
     * ~ If it is providing a url .native will provide choppy audio, and should not be provided
     */
    this.ffmpeg = (
      data instanceof Stream
        ? ffmpeg(data)
          .native()
        : ffmpeg(data)
    )

      .noVideo()
      .toFormat('wav')
      .on('error', (error) => {
        if (data instanceof Stream) {
          data?.destroy();
        }

        if (this.broadcastState === StageBroadcastState.IDLE) { return false; }

        this.reset();

        this.emit(Event.STAGE_CLIENT_ERROR, error);
      })
      .pipe()
      .on('data', (buffer) => {
        /**
         * Ensure that all buffer chunks are 1920 in length and are broadcasted
         * ~ Any buffer chunks that are left over from the previous processing that are smaller than 1920 will be merged into this processing
         * ~ If the resulting buffer is still smaller than 1920 it will be
         *   A) Processed with the next 'data' event
         *   B) Filled with empty audio with the 'finished' event
         */

        const sample = new Int8Array((this.incompleteSample?.length ?? 0) + buffer.length); // Create a new array with the combined length of the two merged buffers

        sample.set(this.incompleteSample || [], 0); // Set the previous buffer as the beginning of the array
        sample.set(new Int8Array(buffer), this.incompleteSample?.length ?? 0);// Set the incoming buffer as the remainder of the array

        this.incompleteSample = sample.length < SLICE_COUNT ? sample : undefined; // If the new buffer is still too small set it as incompleted, else set the incomplete array as undefined

        if (this.incompleteSample) { return; } // Incompleted sample was set indicating new buffer was too small, do not continue processing (If it is the last buffer it will be handled by finished event)

        const chunks = _.chunk(sample, SLICE_COUNT)
          .map((chunk, index, { length }) =>
            (
              {
                isLast: index === length - 1, // Chunk is the last chunk in the array
                isComplete: chunk.length === SLICE_COUNT, // Chunk is the appropriate length
                array: new Int8Array(chunk)
              }
            )
          );

        return chunks.forEach((chunk) => {
          if (chunk.isComplete) {
            this.samples.push(chunk.array);
          } else if (chunk.isLast) {
            this.incompleteSample = chunk.array;
          } else {
            throw new Error('Failure to create complete data chunk\nPlease create an issue https://github.com/dawalters1/wolf.js/issues providing the URL/File that is causing this error');
          }
        });
      })
      .on('finish', () => {
        if (this.incompleteSample) {
          const sample = new Int8Array(SLICE_COUNT);

          sample.set(this.incompleteSample, 0);
          sample.fill(0, this.incompleteSample.length);

          this.samples.push(sample);
        }
        this.completed = true;
      });

    this.broadcastState = this.broadcastState === StageBroadcastState.PAUSED ? StageBroadcastState.PAUSED : StageBroadcastState.PLAYING;

    this.broadcast();

    this.broadcastTimeUpdater = setInterval(() => {
      if (this.broadcastState === StageBroadcastState.PLAYING) {
        this.duration += 1000;
      }
    }, 1000);
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
