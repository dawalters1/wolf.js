import BaseHelper from '../baseHelper.js';
import { ChannelAudioSlot } from '../../entities/channelAudioSlot.js';
import { ChannelMemberCapability } from '../../constants/index.js';
import { Command } from '../../constants/Command.js';

class AudioSlotHelper extends BaseHelper {
  async list (channelId, opts) {
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (channel._audioSlots.fetched) { return channel._audioSlots.values(); }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_LIST,
      {
        body: {
          id: channelId,
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    return response.body.map((serverSlot) => {
      const existing = channel._audioSlots.get(serverSlot.id);
      return channel._audioSlots.set(
        existing
          ? existing.patch(serverSlot)
          : new ChannelAudioSlot(this.client, serverSlot)
      );
    });
  }

  async get (channelId, slotId) {
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    return (await this.list(channelId))[slotId - 1] ?? null;
  }

  async lock (channelId, slotId) {
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

    if (member.id !== this.client.me?.id && !await channel.canPerformActionAgainstMember(member)) { throw new Error(''); }

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
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (!channel.hasCapability(ChannelMemberCapability.MOD)) { throw new Error(''); }

    const slot = await this.get(channelId, slotId);
    if (slot === null) { throw new Error(`Slot with ID ${slotId} not found`); }

    if (!slot.isOccupied) { throw new Error(`Slot with ID ${slotId} is not occupied`); }
    if (!slot.isMuted) { throw new Error(`Slot with ID ${slotId} is not muted`); }

    const member = await this.client.channel.member.getMember(channelId, slot.userId);
    if (member === null) { throw new Error(`Channel Member ${slot.userId} not found in Channel ${channelId}`); }

    if (member.id !== this.client.me?.id) { throw new Error(''); }

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
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (!channel.hasCapability(ChannelMemberCapability.MOD)) { throw new Error(''); }

    const slot = await this.get(channelId, slotId);
    if (slot === null) { throw new Error(`Slot with ID ${slotId} not found`); }

    if (!slot.isOccupied) { throw new Error(`Slot with ID ${slotId} is not occupied`); }

    const member = await this.client.channel.member.getMember(channelId, slot.userId);
    if (member === null) { throw new Error(`Channel Member ${slot.userId} not found in Channel ${channelId}`); }

    if (member.id !== this.client.me?.id && !await channel.canPerformActionAgainstMember(member)) { throw new Error(''); }

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
    throw new Error('NOT IMPLEMENTED');
  }

  async leave (channelId, slotId) {
    const channel = await this.client.channel.getById(channelId);
    if (channel === null) { throw new Error(`Channel with ID ${channelId} not found`); }

    const audioConfig = await channel.getAudioConfig();
    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    const slot = await this.get(channelId, slotId);
    if (slot === null) { throw new Error(`Slot with ID ${slotId} not found`); }

    if (!slot.isOccupied) { throw new Error(`Slot with ID ${slotId} is not occupied`); }

    if (slot.userId !== this.client.me.id) { throw new Error(''); }

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
