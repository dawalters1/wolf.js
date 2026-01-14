import BaseHelper from '../BaseHelper.js';
import ChannelAudioSlotRequest from '../../entities/ChannelAudioSlotRquest.js';

// TODO: check capabilities, check if stage is enabled
export default class AudioSlotRequestHelper extends BaseHelper {
  async fetch (channelId, opts) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${normalisedChannelId}`); }

    if (!opts?.forceNew && channel.audioSlotRequestStore.fetched) { return channel.audioSlotRequestStore.values(); }
    try {
      const response = await this.client.websocket.emit(
        'group audio request list',
        {
          id: normalisedChannelId,
          subscribe: opts?.subscribe ?? true
        }
      );

      channel.audioSlotRequestStore.fetched = true;
      return response.body.map(
        (serverChannelAudioSlotRequest) =>
          channel.roleStore.roles.set(
            new ChannelAudioSlotRequest(this.client, serverChannelAudioSlotRequest)
          )
      );
    } catch (error) {
      // TODO:
    }
  }

  async add (channelId, slotId, userId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);
    const normalisedUserId = this.normaliseNumber(userId);

    const slots = await this.client.audio.slots.fetch(normalisedChannelId);

    if (normalisedSlotId === null) {
      const occupiedSlotOrRequested = slots.find((slot) => slot.userId === this.client.me.id || slot.reservation?.userId === this.client.me.id) ?? null;

      if (occupiedSlotOrRequested) {
        if (occupiedSlotOrRequested.reservation === null) { throw new Error(`Bot already occupies Slot with ID ${occupiedSlotOrRequested.id} in Channel with ID ${normalisedChannelId}`); }
        throw new Error(`Bot already has a reserverations for Slot with ID ${occupiedSlotOrRequested.id} in Channel with ID ${normalisedChannelId}`);
      }

      return await this.client.websocket.emit(
        'group audio request add',
        {
          body: {
            id: normalisedChannelId
          }
        }
      );
    }

    const slot = await this.client.audio.slots.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (slot.isLocked) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} is locked`); }
    if (slot.occuiperId !== null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} is occupied`); }
    if (slot.reservation !== null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} is already reserved`); }

    const occupiedSlotOrRequested = slots.find((slot) => slot.userId === normalisedUserId || slot.reservation?.userId === normalisedUserId) ?? null;

    if (occupiedSlotOrRequested) {
      if (occupiedSlotOrRequested.reservation === null) { throw new Error(`Member already occupies Slot with ID ${occupiedSlotOrRequested.id} in Channel with ID ${normalisedChannelId}`); }
      throw new Error(`Member already has a reserverations for Slot with ID ${occupiedSlotOrRequested.id} in Channel with ID ${normalisedChannelId}`);
    }

    return await this.client.websocket.emit(
      'group audio slot update',
      {
        body: {
          id: normalisedChannelId,
          slot: {
            id: normalisedSlotId,
            reservedOccupierId: normalisedUserId
          }
        }
      }
    );
  }

  async delete (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);
    const slots = await this.client.audio.slots.fetch(normalisedChannelId);

    if (normalisedSlotId === null) {
      const occupiedSlotOrRequested = slots.find((slot) => slot.reservation?.userId === this.client.me.id) ?? null;

      if (!occupiedSlotOrRequested) { throw new Error(`Bot does not have a slot reserveration in Channel with ID ${normalisedChannelId}`); }

      return await this.client.websocket.emit(
        'group audio request delete',
        {
          body: {
            id: normalisedChannelId
          }
        }
      );
    }

    const slot = await this.client.audio.slots.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (slot.isLocked) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} is locked`); }
    if (slot.reservation === null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} is not reserved`); }

    return await this.client.websocket.emit(
      'group audio slot update',
      {
        body: {
          id: normalisedChannelId,
          slot: {
            id: normalisedSlotId,
            reservedOccupierId: undefined
          }
        }
      }
    );
  }

  async clear (channelId) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    const requests = await this.fetch(normalisedChannelId);

    if (!requests.length) { throw new Error(`Channel with ID ${normalisedChannelId} does not have any reservations`); }

    return await this.client.websocket.emit(
      'group audio request clear',
      {
        body: {
          id: normalisedChannelId
        }
      }
    );
  }
}
