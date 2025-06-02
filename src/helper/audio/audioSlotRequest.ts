import ChannelAudioSlotRequest from '../../structures/channelAudioSlotRequest';
import { ChannelAudioSlotRequestOptions } from '../../options/requestOptions';
import { ChannelMemberCapability } from '../../constants';
import { Command } from '../../constants/Command';
import WOLF from '../../client/WOLF';

class AudioSlotRequestHelper {
  readonly client: WOLF;

  constructor (client: WOLF) {
    this.client = client;
  }

  async list (channelId: number, opts?: ChannelAudioSlotRequestOptions): Promise<ChannelAudioSlotRequest[]> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${channelId}`); }

    const audioConfig = await channel.getAudioConfig();

    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    if (!opts?.forceNew && channel.audioSlotRequests.fetched) { return channel.audioSlotRequests.values(); }

    const response = await this.client.websocket.emit<ChannelAudioSlotRequest[]>(
      Command.GROUP_AUDIO_REQUEST_LIST,
      {
        body: {
          id: channelId,
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    channel.audioSlotRequests.fetched = true;

    return channel.audioSlotRequests.setAll(response.body);
  }

  async add (channelId: number, slotId?:number, userId?:number) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);
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

      if (slots.some((slot) => slot.reservation?.userId === userId)) { throw new Error(''); }

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

    const occupiedByMe = slots.find((slot) => slot.userId === this.client.me?.id) ?? null;

    if (occupiedByMe !== null) { throw new Error(`Bot already occupies Slot ${occupiedByMe.id} in Channel with ID ${channelId}`); }

    const myRequest = slots.find((slot) => slot.reservation?.userId === this.client.me?.id) ?? null;

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

  async remove (channelId: number, slotId?: number) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);
    if (!channel.isMember) { throw new Error(`Bot is not member of Channel with ID ${channelId}`); }

    const audioConfig = await channel.getAudioConfig();

    if (!audioConfig?.enabled) { throw new Error(`Channel with ID ${channelId} does not have stage enabled`); }

    const requests = await this.list(channelId);

    if (slotId) {
      if (!channel.hasCapability(ChannelMemberCapability.MOD)) { throw new Error('Bot lacks Channel Capabilities to remove slot request'); }

      const request = requests.find((request) => request.slotId === slotId) ?? null;

      if (request === null) { throw new Error(`No Slot request exists for Slot with ID ${slotId}`); }

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

    const myRequest = requests.find((request) => request.reservation.userId === this.client.me?.id) ?? null;

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

  async clear (channelId: number) {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) throw new Error(`Channel with ID ${channelId} not found`);
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
