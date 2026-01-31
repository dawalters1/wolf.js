import BaseHelper from '../BaseHelper.js';
import ChannelAudioSlotRequest from '../../entities/ChannelAudioSlotRquest.js';
import ChannelMemberCapability from '../../constants/ChannelMemberCapability.js';
import { StatusCodes } from 'http-status-codes';
import { validate } from '../../validation/Validation.js';

// TODO: check capabilities, check if stage is enabled
export default class AudioSlotRequestHelper extends BaseHelper {
  async fetch (channelId, opts) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    validate(normalisedChannelId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean(),
          subscribe: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${normalisedChannelId}`); }

    if (!channel.audioConfig.enabled) { throw new Error(`Channel with ID ${normalisedChannelId} does not have stage enabled`); }

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
      response.body.map(
        (serverChannelAudioSlotRequest) =>
          channel.roleStore.roles.set(
            new ChannelAudioSlotRequest(this.client, serverChannelAudioSlotRequest)
          )
      );
    } catch (error) {
      if (error.code !== StatusCodes.NOT_FOUND) { throw error; }

      channel.audioSlotRequestStore.fetched = true;
    }

    return channel.audioSlotRequestStore.values();
  }

  async add (channelId, slotId, userId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedChannelId, this, this.clear)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedSlotId, this, this.clear)
      .isNotRequired()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    if (normalisedSlotId !== null) {
      validate(normalisedUserId, this, this.clear)
        .isNotNullOrUndefined()
        .isValidNumber()
        .isNumberGreaterThanZero();
    }

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${normalisedChannelId}`); }

    if (!channel.audioConfig.enabled) { throw new Error(`Channel with ID ${normalisedChannelId} does not have stage enabled`); }

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

    if (!await this.client.utility.channel.member.hasCapability(normalisedChannelId, this.client.me.id, ChannelMemberCapability.MOD)) { throw new Error(`Bot lacks Channel Capabilities to add slot request in Channel with ID ${normalisedChannelId}`); }

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

    validate(normalisedChannelId, this, this.delete)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedSlotId, this, this.delete)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${normalisedChannelId}`); }

    if (!channel.audioConfig.enabled) { throw new Error(`Channel with ID ${normalisedChannelId} does not have stage enabled`); }

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

    if (!await this.client.utility.channel.member.hasCapability(normalisedChannelId, this.client.me.id, ChannelMemberCapability.MOD)) { throw new Error(`Bot lacks Channel Capabilities to delete slot request in Channel with ID ${normalisedChannelId}`); }

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

    validate(normalisedChannelId, this, this.clear)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${normalisedChannelId}`); }

    if (!channel.audioConfig.enabled) { throw new Error(`Channel with ID ${normalisedChannelId} does not have stage enabled`); }

    if (!await this.client.utility.channel.member.hasCapability(normalisedChannelId, this.client.me.id, ChannelMemberCapability.MOD)) { throw new Error(`Bot lacks Channel Capabilities to clear slot requests in Channel with ID ${normalisedChannelId}`); }

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
