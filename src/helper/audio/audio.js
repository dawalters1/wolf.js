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
    if (this.audioClients.has(channelId)) {
      throw new Error(`AudioClient exists for channel with id ${channelId}`);
    }

    const audioClient = this.audioClients
      .set(
        channelId,
        new AudioClient(this.client, channelId)
      )
      .get(channelId);

    const sdp = await audioClient.createSDP();

    try {
      const response = await this.client.websocket.emit(
        Command.GROUP_AUDIO_BROADCAST,
        {
          id: channelId,
          slotId,
          sdp
        }
      );

      await audioClient.setResponse(slotId, response.body.sdp);

      return response;
    } catch (error) {
      this.audioClients.delete(channelId);

      throw error;
    }
  }

  async play (channelId, stream) {
    if (!this.audioClients.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.audioClients.get(channelId).play(stream);
  }

  async stop (channelId) {
    if (!this.audioClients.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.audioClients.get(channelId).stop();
  }

  async pause (channelId) {
    if (!this.audioClients.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.audioClients.get(channelId).pause();
  }

  async resume (channelId) {
    if (!this.audioClients.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.audioClients.get(channelId).resume();
  }

  async getClientState (channelId) {
    if (!this.audioClients.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    const client = this.audioClients.get(channelId);

    return {
      connectionState: client.connectionState,
      broadcastState: client.broadcastState
    };
  }

  async getClientSettings (channelId) {
    if (!this.audioClients.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    const client = this.audioClients.get(channelId);

    return client.audioSource.settings;
  }

  async updateClientSettings (channelId, settings) {
    if (!this.audioClients.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    const client = this.audioClients.get(channelId);

    client.updateSettings(settings);
  }
}

export default AudioHelper;
