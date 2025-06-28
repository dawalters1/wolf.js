import AudioClientAudioSourceWrapper from './audioClientAudioSourceWrapper.js';
import ChannelAudioSlotConnectionState from '../../constants/ChannelAudioConnectionState.js';
import ffmpeg from 'fluent-ffmpeg';
import Stream from 'node:stream';
import wrtc, { MediaStream } from '@roamhq/wrtc';
const { RTCSessionDescription, RTCPeerConnection } = wrtc;

class AudioClient {
  constructor (client, channelId) {
    this.client = client;
    this.channelId = channelId;

    this.slotId = undefined;
    this.settings = {
      volume: 0,
      muted: false
    };

    this.broadcastState = undefined;

    this.peerConnection = new RTCPeerConnection();
    this.audioSource = new AudioClientAudioSourceWrapper(48000);
    this.track = this.audioSource.createTrack();
    this.mediaStream = new MediaStream();

    this.mediaStream.addTrack(this.track);
    this.peerConnection.addTrack(this.track, this.mediaStream);

    this.peerConnection.ontrack = ({ streams: [stream] }) => {
      const audio = new Audio();

      audio.srcObject = stream;

      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    };

    this.peerConnection.onconnectionstatechange = async () => {
      const state = this.peerConnection.connectionState;

      if (state === 'connecting') {
        this.connectionState = ChannelAudioSlotConnectionState.PENDING;
        return this.client.emit('channelAudioClientConnecting', this);
      } else if (state === 'connected') {
        if (this.connectionState === ChannelAudioSlotConnectionState.CONNECTED) {
          return this.client.emit('channelAudioClientReady', this);
        }
        this.connectionState = ChannelAudioSlotConnectionState.CONNECTED;
        return this.client.emit('channelAudioClientConnected', this);
      } else if (state === 'disconnected') {
        this.connectionState = ChannelAudioSlotConnectionState.DISCONNECTED;
        return this.client.emit('channelAudioClientDisconnected', this);
      }
    };
  }

  async createSDP () {
    this.peerConnection.setLocalDescription(
      await this.peerConnection.createOffer(
        {
          offerToReceiveAudio: false,
          offerToReceiveVideo: false
        }
      )
    );

    return this.peerConnection.localDescription?.sdp;
  }

  async setResponse (slotId, sdp) {
    this.slotId = slotId;

    this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(
        {
          type: 'answer',
          sdp
        }
      )
    );
  }

  async play (data) {
    this.ffmpeg = (
      data instanceof Stream
        ? ffmpeg(data)
          .native()
        : ffmpeg(data)
    )

      .noVideo()
      .toFormat('wav')
      .on('error', (error) => {
        console.log(error);
      })
      .pipe()
      .on('data', (buffer) => this.audioSource.onData(buffer));
  }

  async stop () {
    this.ffmpeg?.destroy();
  }
}

export default AudioClient;
