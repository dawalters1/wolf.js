import ChannelAudioSlotRequest from '../../entities/channelAudioSlotRequest.js';
import { ChannelMemberCapability } from '../../constants/index.js';
import { Command } from '../../constants/Command.js';
import { validate } from '../../validator/index.js';

class AudioSlotRequestHelper {
  constructor (client) {
    this.client = client;
  }

  async list (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotRequestHelper.list() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotRequestHelper.list() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioSlotRequestHelper.list() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'AudioSlotRequestHelper.list() parameter, opts.{parameter}: {value} {error}');
    }

    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${channelId}`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (!opts?.forceNew && channel._audioSlotRequests.fetched) { return channel._audioSlotRequests.values(); }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_LIST,
      {
        body: {
          id: channelId,
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    channel._audioSlotRequests.fetched = true;

    return response.body.map(serverReq => {
      const existing = channel._audioSlotRequests.get(serverReq.reservedOccupierId);
      return channel._audioSlotRequests.set(
        existing
          ? existing.patch(serverReq)
          : new ChannelAudioSlotRequest(this.client, serverReq)
      );
    });
  }

  async add (channelId, slotId, userId) {
    channelId = Number(channelId) || channelId;
    slotId = Number(slotId) || slotId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotRequestHelper.add() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotRequestHelper.add() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioSlotRequestHelper.add() parameter, channelId: ${channelId} is less than or equal to zero`);
      validate(slotId)
        .isNotNullOrUndefined(`AudioSlotRequestHelper.add() parameter, slotId: ${slotId} is null or undefined`)
        .isValidNumber(`AudioSlotRequestHelper.add() parameter, slotId: ${slotId} is not a valid number`)
        .isGreaterThanZero(`AudioSlotRequestHelper.add() parameter, slotId: ${slotId} is less than or equal to zero`);
      validate(userId)
        .isNotNullOrUndefined(`AudioSlotRequestHelper.add() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`AudioSlotRequestHelper.add() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThanZero(`AudioSlotRequestHelper.add() parameter, userId: ${userId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${channelId}`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    const slots = await channel.getAudioSlots();

    if (slotId) {
      if (!channel.hasCapability(ChannelMemberCapability.MOD)) { throw new Error('Bot lacks Channel Capabilities to add slot request'); }

      const slot = slots[slotId - 1] ?? null;
      if (slot === null) { throw new Error(`Slot with ID ${slotId} not found`); }
      if (slot.isLocked) { throw new Error(`Slot with ID ${slotId} is locked`); }
      if (slots.some((slot) => slot.userId === userId)) { throw new Error(`Channel Member ${userId} already occupies a slot in Channel with ID ${channelId}`); }
      if (slots.some((slot) => slot.reservation?.userId === userId)) { throw new Error(`User with ID ${userId} already has a slot reservation in Channel with ID ${channelId}`); }

      return await this.client.websocket.emit(
        Command.GROUP_AUDIO_SLOT_UPDATE,
        {
          body: {
            id: channelId,
            slot: {
              id: slotId,
              reservedOccupierId: userId
            }
          }
        }
      );
    }

    const occupiedByMe = slots.find(s => s.userId === this.client.me?.id) ?? null;
    if (occupiedByMe !== null) { throw new Error(`Bot already occupies Slot ${occupiedByMe.id} in Channel with ID ${channelId}`); }

    const myRequest = slots.find(s => s.reservation?.userId === this.client.me?.id) ?? null;
    if (myRequest !== null) { throw new Error(`Bot already has a request in Channel with ID ${channelId}`); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_ADD,
      {
        body: {
          id: channelId
        }
      }
    );
  }

  async remove (channelId, slotId) {
    channelId = Number(channelId) || channelId;
    slotId = Number(slotId) || slotId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotRequestHelper.remove() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotRequestHelper.remove() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThanZero(`AudioSlotRequestHelper.remove() parameter, channelId: ${channelId} is less than or equal to zero`);
      validate(slotId)
        .isNotNullOrUndefined(`AudioSlotRequestHelper.remove() parameter, slotId: ${slotId} is null or undefined`)
        .isValidNumber(`AudioSlotRequestHelper.remove() parameter, slotId: ${slotId} is not a valid number`)
        .isGreaterThanZero(`AudioSlotRequestHelper.remove() parameter, slotId: ${slotId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${channelId}`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (slotId) {
      if (!channel.hasCapability(ChannelMemberCapability.MOD)) { throw new Error('Bot lacks Channel Capabilities to remove slot request'); }

      const slots = await channel.audioSlots();
      const slot = slots.find(s => s.id === slotId) ?? null;
      if (slot === null) { throw new Error(`Slot with id ${slotId} not found`); }
      if (!slot.reservation?.userId) { throw new Error(`Slot with id ${slotId} does not have a reservation`); }

      return await this.client.websocket.emit(
        Command.GROUP_AUDIO_SLOT_UPDATE,
        {
          body: {
            id: channelId,
            slot: {
              id: slotId,
              reservedOccupierId: undefined
            }
          }
        }
      );
    }

    const requests = await this.list(channelId);
    const myRequest = requests.find(r => r.reservedUserId === this.client.me?.id) ?? null;
    if (myRequest === null) { throw new Error(`Bot does not have a request in Channel with ID ${channelId}`); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_DELETE,
      {
        body: {
          id: channelId
        }
      }
    );
  }

  async clear (channelId) {
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${channelId}`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (!channel.hasCapability(ChannelMemberCapability.MOD)) { throw new Error('Bot lacks Channel Capabilities to clear slot request list'); }

    const requests = await this.list(channelId);
    if (requests.length === 0) { throw new Error(`Slot request list in channel with ID ${channelId} is already empty`); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_CLEAR,
      {
        body: {
          id: channelId
        }
      }
    );
  }
}

export default AudioSlotRequestHelper;
