import AudioSlotHelper from './audioSlot.js';
import AudioSlotRequestHelper from './audioSlotRequest.js';
import BaseHelper from '../baseHelper.js';
import { ChannelStage } from '../../entities/channelStage.js';
import { Command } from '../../constants/Command.js';
import Stream from 'stream';
import { validate } from '../../validator/index.js';

class AudioHelper extends BaseHelper {
  #slots;
  #slotRequest;
  constructor (client) {
    super(client);

    this.#slots = new AudioSlotHelper(client);
    this.#slotRequest = new AudioSlotRequestHelper(client);
  }

  get slots () {
    return this.#slots;
  }

  get slotRequest () {
    return this.#slotRequest;
  }

  async getAvailableList (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.getAvailableList() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.getAvailableList() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioHelper.getAvailableList() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AudioHelper.getAvailableList() parameter, opts.{parameter}: {value} {error}');
    }

    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    if (!opts?.forceNew && channel.stageStore.fetched) {
      return channel.stageStore.values();
    }

    const response = await this.client.websocket.emit(
      Command.STAGE_GROUP_ACTIVE_LIST,
      {
        body: {
          id: channelId
        }
      }
    );

    channel.stageStore.clear();
    channel.stageStore.fetched = true;

    return response.body.map((serverStage) =>
      channel.stageStore.set(new ChannelStage(this.client, serverStage))
    );
  }

  async getAudioConfig (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.getAudioConfig() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.getAudioConfig() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioHelper.getAudioConfig() parameter, channelId: ${channelId} is less than or equal to zero`);

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
        .isGreaterThan(0, `AudioHelper.getAudioCount() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AudioHelper.getAudioCount() parameter, opts.{parameter}: {value} {error}');
    }

    // TODO:
  }

  async updateAudioConfig (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.updateAudioConfig() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.updateAudioConfig() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioHelper.updateAudioConfig() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AudioHelper.updateAudioConfig() parameter, opts.{parameter}: {value} {error}');
    }
    // Implement as needed
  }

  async play (channelId, stream) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.start() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.start() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioHelper.start() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(stream)
        .isInstanceOf(Stream, `AudioHelper.start() parameter, stream: ${stream} is not a valid stream`);
    }

    if (!this.#slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.#slots.get(channelId).play(stream);
  }

  async stop (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.stop() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.stop() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioHelper.stop() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.#slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.#slots.get(channelId).stop();
  }

  async pause (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.pause() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.pause() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioHelper.pause() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.#slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.#slots.get(channelId).pause();
  }

  async resume (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.join() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.join() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioHelper.join() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.#slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    return this.#slots.get(channelId).resume();
  }

  async hasClient (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.getClientState() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.getClientState() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioHelper.getClientState() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    return this.#slots.audioClients.has(channelId);
  }

  async getClientState (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.getClientState() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.getClientState() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioHelper.getClientState() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.#slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    const client = this.#slots.get(channelId);

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
        .isGreaterThan(0, `AudioHelper.getClientSettings() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.#slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    const client = this.#slots.get(channelId);

    return client.audioSource.settings;
  }

  async updateClientSettings (channelId, settings) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.updateClientSettings() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioHelper.updateClientSettings() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioHelper.updateClientSettings() parameter, channelId: ${channelId} is less than or equal to zero`);
    }

    if (!this.#slots.slots.has(channelId)) {
      throw new Error(`Channel with id ${channelId} does not have a client`);
    }

    const client = this.#slots.get(channelId);

    client.updateSettings(settings);
  }
}

export default AudioHelper;
