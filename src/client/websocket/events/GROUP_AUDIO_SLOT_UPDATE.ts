import BaseEvent from './baseEvent';
import { ServerGroupAudioSlot } from '../../../structures/channelAudioSlot';
import WOLF from '../../WOLF';

export interface ServerGroupAudioSlotUpdate{
  id: number,
  sourceSubscriberId: number,
  slot: ServerGroupAudioSlot
}

class GroupAudioCountUpdateEvent extends BaseEvent<ServerGroupAudioSlotUpdate> {
  constructor (client: WOLF) {
    super(client, 'group audio slot update');
  }

  async process (data: ServerGroupAudioSlotUpdate) {
    const channel = this.client.channel.cache.get(data.id);

    if (channel === null) { return; }

    if (channel.audioSlots === null) { return; }

    const oldChannelAudioSlot = channel.audioSlots.get(data.slot.id);

    if (oldChannelAudioSlot === null) { return; }

    this.client.emit(
      'channelAudioSlotUpdate',
      oldChannelAudioSlot.clone(),
      oldChannelAudioSlot.patch(data)
    );
  }
}

export default GroupAudioCountUpdateEvent;
