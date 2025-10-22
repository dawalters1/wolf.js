import AudioClient from '../../client/audio/audioClient.js';
import BaseHelper from '../baseHelper.js';
import { ChannelAudioSlot } from '../../entities/channelAudioSlot.js';
import { ChannelMemberCapability } from '../../constants/index.js';
import { Command } from '../../constants/Command.js';
import { validate } from '../../validator/index.js';

class AudioSlotHelper extends BaseHelper {
  constructor (client) {
    super(client);

    this.audioClients = new Map();
  }

  async list (channelId, opts) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotHelper.list() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.list() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.list() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'AudioSlotHelper.list() parameter, opts.{parameter}: {value} {error}');
    }

    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    if (!channel.isMember && !channel.peekable) { throw new Error(`Channel with id ${channelId} is not peekable`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (channel.audioSlotStore.fetched) { return channel.audioSlotStore.values(); }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_LIST,
      {
        body: {
          id: channelId,
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    channel.audioSlotStore.fetched = true;

    return response.body.map((serverSlot) =>
      channel.audioSlotStore.set(
        new ChannelAudioSlot(this.client, serverSlot, channelId)
      )
    );
  }

  async get (channelId, slotId) {
    channelId = Number(channelId) || channelId;
    slotId = Number(slotId) || slotId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotHelper.get() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.get() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.get() parameter, channelId: ${channelId} is less than or equal to zero`);
      validate(slotId)
        .isNotNullOrUndefined(`AudioSlotHelper.get() parameter, slotId: ${slotId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.get() parameter, slotId: ${slotId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.get() parameter, slotId: ${slotId} is less than or equal to zero`);
    }

    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    return (await this.list(channelId))[slotId - 1] ?? null;
  }

  async lock (channelId, slotId) {
    channelId = Number(channelId) || channelId;
    slotId = Number(slotId) || slotId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotHelper.lock() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.lock() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.lock() parameter, channelId: ${channelId} is less than or equal to zero`);
      validate(slotId)
        .isNotNullOrUndefined(`AudioSlotHelper.lock() parameter, slotId: ${slotId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.lock() parameter, slotId: ${slotId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.lock() parameter, slotId: ${slotId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (!channel.hasCapability(ChannelMemberCapability.MOD)) { throw new Error('Bot lacks Channel Capabilities to update slot lock state'); }

    const slot = await this.get(channelId, slotId);
    if (slot === null) { throw new Error(`Slot with ID ${slotId} not found`); }

    if (slot.isLocked) { throw new Error(`Slot with ID ${slotId} is already locked`); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_UPDATE,
      {
        body: {
          id: channelId,
          slot: { id: slotId, locked: true }
        }
      }
    );
  }

  async unlock (channelId, slotId) {
    channelId = Number(channelId) || channelId;
    slotId = Number(slotId) || slotId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotHelper.unlock() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.unlock() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.unlock() parameter, channelId: ${channelId} is less than or equal to zero`);
      validate(slotId)
        .isNotNullOrUndefined(`AudioSlotHelper.unlock() parameter, slotId: ${slotId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.unlock() parameter, slotId: ${slotId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.unlock() parameter, slotId: ${slotId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (!channel.hasCapability(ChannelMemberCapability.MOD)) { throw new Error('Bot lacks Channel Capabilities to update slot lock state'); }

    const slot = await this.get(channelId, slotId);
    if (slot === null) { throw new Error(`Slot with ID ${slotId} not found`); }

    if (!slot.isLocked) { throw new Error(`Slot with ID ${slotId} is not locked`); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_UPDATE,
      {
        body: {
          id: channelId,
          slot: { id: slotId, locked: false }
        }
      }
    );
  }

  async mute (channelId, slotId) {
    channelId = Number(channelId) || channelId;
    slotId = Number(slotId) || slotId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotHelper.mute() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.mute() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.mute() parameter, channelId: ${channelId} is less than or equal to zero`);
      validate(slotId)
        .isNotNullOrUndefined(`AudioSlotHelper.mute() parameter, slotId: ${slotId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.mute() parameter, slotId: ${slotId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.mute() parameter, slotId: ${slotId} is less than or equal to zero`);
    }

    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (!channel.hasCapability(ChannelMemberCapability.MOD)) { throw new Error('Bot lacks Channel Capabilities to update slot mute state'); }

    const slot = await this.get(channelId, slotId);
    if (slot === null) { throw new Error(`Slot with ID ${slotId} not found`); }

    if (!slot.isOccupied) { throw new Error(`Slot with ID ${slotId} is not occupied`); }
    if (slot.isMuted) { throw new Error(`Slot with ID ${slotId} is already muted`); }

    const member = await this.client.channel.member.getMember(channelId, slot.userId);
    if (member === null) { throw new Error(`Channel Member ${slot.userId} not found in Channel ${channelId}`); }

    if (member.id !== this.client.me?.id && !await channel.canPerformActionAgainstMember(member)) { throw new Error('Bot lacks Channel Capabilities to mute slot occupier'); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_UPDATE,
      {
        body: {
          id: channelId,
          slotId,
          occupierId: slot.userId,
          occupierMuted: true
        }
      }
    );
  }

  async unmute (channelId, slotId) {
    channelId = Number(channelId) || channelId;
    slotId = Number(slotId) || slotId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotHelper.unmute() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.unmute() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.unmute() parameter, channelId: ${channelId} is less than or equal to zero`);
      validate(slotId)
        .isNotNullOrUndefined(`AudioSlotHelper.unmute() parameter, slotId: ${slotId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.unmute() parameter, slotId: ${slotId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.unmute() parameter, slotId: ${slotId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    const slot = await this.get(channelId, slotId);
    if (slot === null) { throw new Error(`Slot with ID ${slotId} not found`); }

    if (!slot.isOccupied) { throw new Error(`Slot with ID ${slotId} is not occupied`); }
    if (!slot.isMuted) { throw new Error(`Slot with ID ${slotId} is not muted`); }

    const member = await this.client.channel.member.getMember(channelId, slot.userId);
    if (member === null) { throw new Error(`Channel Member ${slot.userId} not found in Channel ${channelId}`); }

    if (member.id !== this.client.me?.id) { throw new Error('Bot is not slot occupier'); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_UPDATE,
      {
        body: {
          id: channelId,
          slotId,
          occupierId: slot.userId,
          occupierMuted: false
        }
      }
    );
  }

  async kick (channelId, slotId) {
    channelId = Number(channelId) || channelId;
    slotId = Number(slotId) || slotId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotHelper.kick() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.kick() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.kick() parameter, channelId: ${channelId} is less than or equal to zero`);
      validate(slotId)
        .isNotNullOrUndefined(`AudioSlotHelper.kick() parameter, slotId: ${slotId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.kick() parameter, slotId: ${slotId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.kick() parameter, slotId: ${slotId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (!channel.hasCapability(ChannelMemberCapability.MOD)) { throw new Error('Bot lacks Channel Capabilities to kick slot occupier'); }

    const slot = await this.get(channelId, slotId);
    if (slot === null) { throw new Error(`Slot with ID ${slotId} not found`); }

    if (!slot.isOccupied) { throw new Error(`Slot with ID ${slotId} is not occupied`); }

    const member = await this.client.channel.member.getMember(channelId, slot.userId);
    if (member === null) { throw new Error(`Channel Member ${slot.userId} not found in Channel ${channelId}`); }

    if (member.id !== this.client.me?.id && !await channel.canPerformActionAgainstMember(member)) { throw new Error('Bot lacks Channel Capabilities to kick slot occupier'); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_DISCONNECT,
      {
        body: {
          id: channelId,
          slotId,
          occupierId: slot.userId
        }
      }
    );
  }

  async join (channelId, slotId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioHelper.join() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.join() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.join() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(slotId)
        .isNotNullOrUndefined(`AudioHelper.join() parameter, channelId: ${slotId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.join() parameter, channelId: ${slotId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.join() parameter, channelId: ${slotId} is less than or equal to zero`);
    }

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

  async leave (channelId, slotId) {
    channelId = Number(channelId) || channelId;
    slotId = Number(slotId) || slotId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`AudioSlotHelper.leave() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.leave() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.leave() parameter, channelId: ${channelId} is less than or equal to zero`);
      validate(slotId)
        .isNotNullOrUndefined(`AudioSlotHelper.leave() parameter, slotId: ${slotId} is null or undefined`)
        .isValidNumber(`AudioSlotHelper.leave() parameter, slotId: ${slotId} is not a valid number`)
        .isGreaterThan(0, `AudioSlotHelper.leave() parameter, slotId: ${slotId} is less than or equal to zero`);
    }
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    const slot = await this.get(channelId, slotId);
    if (slot === null) { throw new Error(`Slot with ID ${slotId} not found`); }

    if (!slot.isOccupied) { throw new Error(`Slot with ID ${slotId} is not occupied`); }

    if (slot.userId !== this.client.me.id) { throw new Error('Bot is not slot occupier'); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_DISCONNECT,
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

export default AudioSlotHelper;
