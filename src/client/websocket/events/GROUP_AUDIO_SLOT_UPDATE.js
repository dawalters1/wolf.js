import BaseEvent from './baseEvent.js';

class GroupAudioCountUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio slot update');
  }

  async process (data) {
    const channel = this.client.channel.cache.get(data.id);

    if (channel === null) { return; }

    if (channel._audioSlots === null) { return; }

    const oldChannelAudioSlot = channel._audioSlots.get(data.slot.id);

    if (oldChannelAudioSlot === null) { return; }

    this.client.emit(
      'channelAudioSlotUpdate',
      oldChannelAudioSlot.clone(),
      oldChannelAudioSlot.patch(data)
    );
  }
}

export default GroupAudioCountUpdateEvent;
