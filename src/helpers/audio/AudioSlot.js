import BaseHelper from '../BaseHelper.js';
import ChannelAudioSlot from '../../entities/ChannelAudioSlot.js';

export default class AudioSlotHelper extends BaseHelper {
  async fetch (channelId, slotId, opts) {
    if (slotId instanceof Object) {
      opts = slotId;
      slotId = null;
    }

    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);

    const channel = await this.client.channel.fetch(normalisedSlotId);

    if (!slotId === null) {
      if (!opts?.forceNew && channel.audioSlotStore.fetched) { return channel.audioSlotStore.values(); }

      const response = await this.client.websocket.emit(
        'group audio slot list',
        {
          body: {
            id: normalisedChannelId,
            subscribe: opts?.subscribe ?? true
          }
        }
      );

      channel.audioSlotStore.fetched = true;

      return response.body.map((serverSlot) => {
        serverSlot.groupId = normalisedChannelId;

        return channel.audioSlotStore.set(
          new ChannelAudioSlot(this.client, serverSlot, channelId)
        );
      });
    }

    const slots = await this.fetch(channelId, opts);

    return slots.find((slot) => slot.id === normalisedSlotId) ?? null;
  }

  async lock (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);

    const slot = await this.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (!slot.isLocked) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} is locked`); }

    return await this.client.websocket.emit(
      'group audio slot update',
      {
        id: normalisedChannelId,
        slot: {
          id: normalisedSlotId,
          locked: true
        }
      }
    );
  }

  async unlock (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);

    const slot = await this.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (!slot.isLocked) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} is not locked`); }

    return await this.client.websocket.emit(
      'group audio slot update',
      {
        id: normalisedChannelId,
        slot: {
          id: normalisedSlotId,
          locked: false
        }
      }
    );
  }

  async mute (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);

    const slot = await this.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (!slot.isMuted) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} is muted`); }

    return await this.client.websocket.emit(
      'group audio broadcast update',
      {
        id: normalisedChannelId,
        slotId: normalisedSlotId,
        occupierId: slot.occupierId,
        occupierMuted: true
      }
    );
  }

  async unmute (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);

    const slot = await this.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (!slot.isMuted) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} is not muted`); }

    if (slot.occupierId !== this.client.me.id) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} is not occupied by bot`); }

    return await this.client.websocket.emit(
      'group audio broadcast update',
      {
        id: normalisedChannelId,
        slotId: normalisedSlotId,
        occupierId: slot.occupierId,
        occupierMuted: false
      }
    );
  }

  async kick (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);

    const slot = await this.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (slot.occupierId === null) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} is not occupied`); }

    return await this.client.websocket.emit(
      'group audio broadcast disconnect',
      {
        id: normalisedChannelId,
        slotId: normalisedSlotId,
        occupierId: slot.occupierId
      }
    );
  }

  async join (channelId, slotId, sdp) {

  }
}
