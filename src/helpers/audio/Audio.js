import AudioSlotHelper from './AudioSlot.js';
import AudioSlotRequestHelper from './AudioSlotRequest.js';
import BaseHelper from '../BaseHelper.js';
import ChannelStage from '../../entities/ChannelStage.js';
import { StatusCodes } from 'http-status-codes';

export default class AudioHelper extends BaseHelper {
  #slots;

  constructor (client) {
    super(client);
    this.#slots = new AudioSlotHelper(client);
  }

  get slots () {
    return this.#slots;
  }

  async available (channelId, opts) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (!opts?.forceNew && channel.stageStore.fetched) { return channel.stageStore.values(); }

    try {
      const response = await this.client.websocket.emit(
        'stage group active list',
        {
          body: {
            id: normalisedChannelId
          }
        }
      );

      channel.stageStore.clear();
      response.body.map((serverStage) =>
        channel.stageStore.set(new ChannelStage(this.client, serverStage))
      );
    } catch (error) {
      if (error.code !== StatusCodes.NOT_FOUND) { throw error; }
      channel.stageStore.clear();
    }

    channel.stageStore.fetched = true;
    return channel.stageStore.values();
  }

  async play (channelId, stream) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    const client = this.#slots.clients.get(normalisedChannelId);

    if (client === null) { throw new Error(`Channel with ID ${normalisedChannelId} does not have a Stage Client`); }

    return client.play(stream);
  }

  async pause (channelId) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    const client = this.#slots.clients.get(normalisedChannelId);

    if (client === null) { throw new Error(`Channel with ID ${normalisedChannelId} does not have a Stage Client`); }

    return client.pause();
  }

  async resume (channelId) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    const client = this.#slots.clients.get(normalisedChannelId);

    if (client === null) { throw new Error(`Channel with ID ${normalisedChannelId} does not have a Stage Client`); }

    return client.resume();
  }

  async stop (channelId) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    const client = this.#slots.clients.get(normalisedChannelId);

    if (client === null) { throw new Error(`Channel with ID ${normalisedChannelId} does not have a Stage Client`); }

    return client.stop();
  }
}
