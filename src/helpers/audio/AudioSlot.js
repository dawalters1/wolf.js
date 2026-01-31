import AudioSlotRequestHelper from './AudioSlotRequest.js';
import BaseHelper from '../BaseHelper.js';
import ChannelAudioSlot from '../../entities/ChannelAudioSlot.js';
import ChannelMemberCapability from '../../constants/ChannelMemberCapability.js';
import StageClient from '../../client/stage/Stage.js';
import { validate } from '../../validation/Validation.js';

export default class AudioSlotHelper extends BaseHelper {
  #clients = new Map();
  #request;
  constructor (client) {
    super(client);

    this.#request = new AudioSlotRequestHelper(client);
  }

  get request () {
    return this.#request;
  }

  get clients () {
    return this.#clients;
  }

  async fetch (channelId, slotId, opts) {
    if (this.isObject(slotId)) {
      opts = slotId;
      slotId = null;
    }

    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);

    validate(normalisedChannelId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedSlotId, this, this.fetch)
      .isNotRequired()
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

    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (normalisedSlotId === null) {
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
          new ChannelAudioSlot(this.client, serverSlot)
        );
      });
    }

    const slots = await this.fetch(channelId, opts);

    return slots.find((slot) => slot.id === normalisedSlotId) ?? null;
  }

  async lock (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);

    validate(normalisedChannelId, this, this.lock)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedSlotId, this, this.lock)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${normalisedChannelId}`); }

    if (!await this.client.utility.channel.member.hasCapability(normalisedChannelId, this.client.me.id, ChannelMemberCapability.MOD)) { throw new Error(`Bot lacks Channel Capabilities to add slot request in Channel with ID ${normalisedChannelId}`); }

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

    validate(normalisedChannelId, this, this.unlock)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedSlotId, this, this.unlock)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${normalisedChannelId}`); }

    if (!await this.client.utility.channel.member.hasCapability(normalisedChannelId, this.client.me.id, ChannelMemberCapability.MOD)) { throw new Error(`Bot lacks Channel Capabilities to add slot request in Channel with ID ${normalisedChannelId}`); }

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

    validate(normalisedChannelId, this, this.mute)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedSlotId, this, this.mute)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${normalisedChannelId}`); }

    const slot = await this.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (!slot.isMuted) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} is muted`); }

    if (slot.occupierId !== this.client.me.id && !await this.client.utility.channel.member.canPerformActionAgainst(normalisedChannelId, slot.occupierId)) { throw new Error(''); }

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

    validate(normalisedChannelId, this, this.unmute)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedSlotId, this, this.unmute)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${normalisedChannelId}`); }

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

    validate(normalisedChannelId, this, this.kick)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedSlotId, this, this.kick)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const channel = await this.client.channel.fetch(channelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${normalisedChannelId}`); }

    const slot = await this.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedChannelId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (slot.occupierId === null) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} is not occupied`); }

    if (slot.occupierId !== this.client.me.id && !await this.client.utility.channel.member.canPerformActionAgainst(normalisedChannelId, slot.occupierId)) { throw new Error(''); }

    return await this.client.websocket.emit(
      'group audio broadcast disconnect',
      {
        id: normalisedChannelId,
        slotId: normalisedSlotId,
        occupierId: slot.occupierId
      }
    );
  }

  async join (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);

    validate(normalisedChannelId, this, this.join)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedSlotId, this, this.join)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    if (this.#clients.has(normalisedChannelId)) { return; }

    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Not member of Channel with ID ${normalisedChannelId}`); }

    const slot = await this.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (slot.isOccupied) {
      if (slot.userId !== this.client.me.id) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} is occupied`); }
      await this.leave(normalisedChannelId, normalisedSlotId);
    }

    const client = new StageClient(this.client, normalisedChannelId);

    this.#clients.set(normalisedChannelId, client);

    const sdp = await client.createSDP();

    try {
      const response = await this.client.websocket.emit(
        'group audio broadcast',
        {
          id: normalisedChannelId,
          slotId: normalisedSlotId,
          sdp
        }
      );

      await client.setResponse(normalisedSlotId, response.body.sdp);

      return response;
    } catch (error) {
      this.#clients.delete(normalisedChannelId);

      throw error;
    }
  }

  async leave (channelId, slotId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedSlotId = this.normaliseNumber(slotId);

    validate(normalisedChannelId, this, this.leave)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedSlotId, this, this.leave)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (!channel.isMember) { throw new Error(`Not member of Channel with ID ${normalisedChannelId}`); }

    const slot = await this.fetch(normalisedChannelId, normalisedSlotId);

    if (slot === null) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} NOT FOUND`); }
    if (slot.userId !== this.client.me.id) { throw new Error(`Slot with ID ${normalisedSlotId} in Channel with ID ${normalisedChannelId} not occupied by bot`); }

    this.#clients.delete(normalisedChannelId);

    return await this.client.websocket.emit(
      'group audio broadcast disconnect',
      {
        body: {
          id: channelId,
          slotId,
          occupierId: slot.userId
        }
      }
    );
  }
}
