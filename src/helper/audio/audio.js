import AudioClient from '../../client/audio/audioClient.js';
import AudioSlotHelper from './audioSlot.js';
import AudioSlotRequestHelper from './audioSlotRequest.js';
import { ChannelStage } from '../../entities/channelStage.js';
import { Command } from '../../constants/Command.js';

class AudioHelper {
  constructor (client) {
    this.client = client;
    this.slots = new AudioSlotHelper(client);
    this.slotRequest = new AudioSlotRequestHelper(client);
    this.audioClients = new Map();
  }

  async getAvailableList (channelId, opts) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(''); }

    if (!opts?.forceNew && channel._stages.fetched) {
      return channel._stages.values();
    }

    const response = await this.client.websocket.emit(
      Command.STAGE_GROUP_ACTIVE_LIST,
      {
        body: {
          id: channelId
        }
      }
    );

    channel._stages.clear();
    channel._stages.fetched = true;
    return channel._stages.setAll(response.body.map(serverStage => new ChannelStage(this.client, serverStage)));
  }

  async getAudioConfig (channelId) {
    // Implement as needed
  }

  async getAudioCount (channelId) {
    // Implement as needed
  }

  async updateAudioConfig (channelId) {
    // Implement as needed
  }

  async join (channelId, slotId) {
    const audioClient = new AudioClient(this.client, channelId);

    const sdp = await audioClient.createSDP();

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST,
      {
        id: channelId,
        slotId,
        sdp
      }
    );

    await audioClient.setResponse(slotId, response.body.sdp);

    return audioClient;
  }
}

export default AudioHelper;
