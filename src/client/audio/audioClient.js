// Mostly chatgpts work, works a hell of a lot better than v2.

import ChannelAudioSlotConnectionState from '../../constants/ChannelAudioConnectionState.js';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import path from 'path';
import Stream from 'node:stream';
import { Worker } from 'node:worker_threads';
import wrtc from '@roamhq/wrtc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { nonstandard, MediaStream, RTCSessionDescription, RTCPeerConnection } = wrtc;

const SAMPLE_RATE = 48000;
const CHANNEL_COUNT = 2;
const BITRATE = 16;
const FRAMES = 480;

class AudioClient {
  constructor (client, channelId, settings = { volume: 1, muted: false }) {
    this.client = client;
    this.channelId = channelId;

    this.slotId = undefined;
    this.settings = settings;
    this._broadcastState = 'idle';
    this.connectionState = ChannelAudioSlotConnectionState.DISCONNECTED;

    this.state = 'disabled';
    this.paused = false;

    this.leftoverSamples = new Int16Array(FRAMES * CHANNEL_COUNT);
    this.leftoverSamples.fill(0);
    this.numLeftoverSamples = 0;

    this.peerConnection = new RTCPeerConnection();

    this.audioSource = new nonstandard.RTCAudioSource();
    this.track = this.audioSource.createTrack();
    this.mediaStream = new MediaStream([this.track]);
    this.peerConnection.addTrack(this.track, this.mediaStream);

    this.MIN_PRELOAD_FRAMES = 3;
    this.underrunCount = 0;

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;

      switch (state) {
        case 'connecting':
          this.connectionState = ChannelAudioSlotConnectionState.PENDING;
          this.client.emit('channelAudioClientConnecting', this);
          break;

        case 'connected':
          if (this.connectionState === ChannelAudioSlotConnectionState.CONNECTED) {
            this.client.emit('channelAudioClientReady', this);
          } else {
            this.connectionState = ChannelAudioSlotConnectionState.CONNECTED;
            this.client.emit('channelAudioClientConnected', this);
          }
          break;

        case 'disconnected':
          this.connectionState = ChannelAudioSlotConnectionState.DISCONNECTED;
          this.client.emit('channelAudioClientDisconnected', this);
          break;
      }
    };

    this.worker = new Worker(path.join(__dirname, 'audioWorker.js'));
    this.worker.on('message', this._handleWorkerMessage.bind(this));

    this.worker.postMessage({ type: 'init', frameDurationMs: 10 });
  }

  _handleWorkerMessage (message) {
    if (message.type === 'underrun') {
      this.underrunCount = message.count;
    } else if (message.type === 'audioFrame') {
      this.audioSource.onData(message.data);
    }
  }

  set broadcastState (value) {
    this.state = value === 'playing'
      ? 'enabled'
      : 'disabled';
    this._broadcastState = value;
  }

  get broadcastState () {
    return this._broadcastState;
  }

  updateSettings (settings) {
    if (settings.muted !== this.settings.muted) {
      this.client.emit(
        settings.muted
          ? 'channelAudioClientBroadcastMuted'
          : 'channelAudioClientBroadcastUnmuted',
        this.channelId
      );
    }

    this.settings = settings;

    this.worker.postMessage({ type: 'updateVolume', volume: this.settings.volume });
  }

  enqueue (item) {
    this.worker.postMessage({ type: 'enqueue', data: item });
  }

  async processBuffer (buffer) {
    if (!(buffer.buffer instanceof ArrayBuffer)) {
      throw new Error('Expected an ArrayBuffer');
    }

    // Interpret buffer as Int16Array because WAV PCM 16-bit samples
    const samples = new Int16Array(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength / Int16Array.BYTES_PER_ELEMENT
    );

    let chunkStart = 0;

    while (chunkStart < samples.length) {
      // Wanted samples per chunk must include both channels
      const wantedSamples = FRAMES * CHANNEL_COUNT - this.numLeftoverSamples;
      const remainingSamples = samples.length - chunkStart;

      if (remainingSamples < wantedSamples) {
        this.leftoverSamples.set(samples.slice(chunkStart));
        this.numLeftoverSamples = remainingSamples;
        break;
      }

      let chunk = samples.slice(chunkStart, chunkStart + wantedSamples);

      if (this.numLeftoverSamples) {
        this.leftoverSamples.set(chunk, this.numLeftoverSamples);
        chunk = this.leftoverSamples;
        this.numLeftoverSamples = 0;
      }

      this.enqueue({
        samples: chunk,
        sampleRate: SAMPLE_RATE,
        bitsPerSample: BITRATE,
        channelCount: CHANNEL_COUNT,
        numberOfFrames: FRAMES
      });

      chunkStart += wantedSamples;
    }
  }

  async createSDP () {
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });
    await this.peerConnection.setLocalDescription(offer);
    return this.peerConnection.localDescription?.sdp;
  }

  async setResponse (slotId, sdp) {
    this.slotId = slotId;
    const description = new RTCSessionDescription({ type: 'answer', sdp });
    await this.peerConnection.setRemoteDescription(description);
  }

  async play (data) {
    let closed = false;

    this.ffmpeg?.kill('SIGKILL');

    this.ffmpeg = data instanceof Stream
      ? ffmpeg(data).native()
      : ffmpeg(data);

    this.ffmpeg
      .noVideo()
      .toFormat('wav')
      .on('error', (error) => {
        if (data instanceof Stream) {
          data?.destroy();
        }
        if (closed) {
          return;
        }
      })
      .pipe()
      .on('close', () => {
        closed = true;
      })
      .on('pipe', () => {
        this.broadcastState = 'playing';
        this.client.emit('channelAudioClientBroadcastStarted', this.channelId);
      })
      .on('data', (buffer) => this.processBuffer(buffer))
      .on('finish', () => {
        this.broadcastState = 'idle';
        this.client.emit('channelAudioClientBroadcastFinished', this.channelId);
      });
  }

  async stop () {
    this.ffmpeg?.kill('SIGKILL');
    this.client.emit('channelAudioClientBroadcastStopped', this.channelId);
  }

  async pause () {
    this.broadcastState = 'paused';
    this.paused = true;
    this.client.emit('channelAudioClientBroadcastPaused', this.channelId);

    this.worker.postMessage({ type: 'pause' });
  }

  async resume () {
    this.broadcastState = this.ffmpeg
      ? 'playing'
      : 'idle';
    this.paused = false;
    this.client.emit('channelAudioClientBroadcastResume', this.channelId);

    this.worker.postMessage({ type: 'resume' });
  }

  async destroy () {
    await this.worker.terminate();
  }
}

export default AudioClient;
