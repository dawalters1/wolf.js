import { Command } from '../../constants/Command';
import { StageSlotOptions } from '../../options/requestOptions';
import { ChannelAudioSlot } from '../../structures/channelAudioSlot';
import WOLFResponse from '../../structures/WOLFResponse';
import Base from '../base';

class StageSlotHelper extends Base {
  async list (channelId: number, opts?: StageSlotOptions): Promise<ChannelAudioSlot[]> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(''); }

    if (channel.audioSlots.fetched) { return channel.audioSlots.values(); }

    const response = await this.client.websocket.emit<ChannelAudioSlot[]>(
      Command.GROUP_AUDIO_SLOT_LIST,
      {
        body: {
          id: channelId,
          subscribe: opts?.subscribe ?? true
        }
      }
    );

    return channel.audioSlots.mset(response.body);
  }

  async get (channelId: number, slotId: number): Promise<ChannelAudioSlot | null> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(''); }

    return (await this.list(channelId))[slotId] ?? null;
  }

  async lock (channelId: number, slotId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(''); }

    // TODO: Capability check

    const slot = await this.get(channelId, slotId);

    if (slot === null) { throw new Error(''); }

    if (slot.isLocked) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_UPDATE,
      {
        body: {
          id: channelId,
          slot: {
            id: slotId,
            locked: true
          }
        }
      }
    );
  }

  async unlock (channelId: number, slotId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(''); }

    // TODO: Capability check

    const slot = await this.get(channelId, slotId);

    if (slot === null) { throw new Error(''); }

    if (!slot.isLocked) { throw new Error(''); }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_UPDATE,
      {
        body: {
          id: channelId,
          slot: {
            id: slotId,
            locked: false
          }
        }
      }
    );
  }

  async mute (channelId: number, slotId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(''); }

    // TODO: Capability check

    const slot = await this.get(channelId, slotId);

    if (slot === null) { throw new Error(''); }

    if (!slot.isOccupied) { throw new Error(''); };

    if (slot.isMuted) { throw new Error(''); }

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

  async unmute (channelId: number, slotId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(''); }

    // TODO: Capability check

    const slot = await this.get(channelId, slotId);

    if (slot === null) { throw new Error(''); }

    if (!slot.isOccupied) { throw new Error(''); };

    if (!slot.isMuted) { throw new Error(''); }

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

  async kick (channelId: number, slotId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(''); }

    // TODO: Capability check

    const slot = await this.get(channelId, slotId);

    if (slot === null) { throw new Error(''); }

    if (!slot.isOccupied) { throw new Error(''); };

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

  async join (channelId: number, slotId: number): Promise<WOLFResponse> {
    throw new Error('NOT IMPLEMENTED');
  }

  async leave (channelId: number, slotId: number): Promise<WOLFResponse> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(''); }

    const slot = await this.get(channelId, slotId);

    if (slot === null) { throw new Error(''); }

    if (!slot.isOccupied) { throw new Error(''); };

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (slot.userId !== this.client.me!.id) { throw new Error(''); }

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

export default StageSlotHelper;
