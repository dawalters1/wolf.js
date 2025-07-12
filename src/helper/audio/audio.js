import AudioSlotHelper from './audioSlot.js';
import AudioSlotRequestHelper from './audioSlotRequest.js';
import { ChannelStage } from '../../entities/channelStage.js';
import { Command } from '../../constants/Command.js';
import { validate } from '../../validator/index.js';

class AudioHelper {
  constructor (client) {
    this.client = client;
    this.slots = new AudioSlotHelper(client);
    this.slotRequest = new AudioSlotRequestHelper(client);
  }

  async getAvailableList (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.getAvailableList() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.getAvailableList() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioHelper.getAvailableList() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AudioHelper.getAvailableList() parameter, opts.{parameter}: {value} {error}');
    }

    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

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

  async getAudioConfig (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.getAudioConfig() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.getAudioConfig() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioHelper.getAudioConfig() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AudioHelper.getAudioConfig() parameter, opts.{parameter}: {value} {error}');
    }
    // Implement as needed
  }

  async getAudioCount (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.getAudioCount() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.getAudioCount() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioHelper.getAudioCount() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AudioHelper.getAudioCount() parameter, opts.{parameter}: {value} {error}');
    }
    // Implement as needed
  }

  async updateAudioConfig (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.updateAudioConfig() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.updateAudioConfig() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioHelper.updateAudioConfig() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AudioHelper.updateAudioConfig() parameter, opts.{parameter}: {value} {error}');
    }
    // Implement as needed
  }

  async stop (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.stop() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.stop() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioHelper.stop() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.slots.get(channelId).stop();
  }

  async pause (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.pause() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.pause() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioHelper.pause() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.slots.get(channelId).pause();
  }

  async resume (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.join() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.join() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioHelper.join() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.slots.get(channelId).resume();
  }

  async getClientState (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.getClientState() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.getClientState() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioHelper.getClientState() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    const client = this.slots.get(channelId);

    return {
      connectionState: client.connectionState,
      broadcastState: client.broadcastState
    };
  }

  async getClientSettings (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.getClientSettings() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.getClientSettings() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioHelper.getClientSettings() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    const client = this.slots.get(channelId);

    return client.audioSource.settings;
  }

  async updateClientSettings (channelId, settings) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.updateClientSettings() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.updateClientSettings() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioHelper.updateClientSettings() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.slots.slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    const client = this.slots.get(channelId);

    client.updateSettings(settings);
  }
}

export default AudioHelper;
