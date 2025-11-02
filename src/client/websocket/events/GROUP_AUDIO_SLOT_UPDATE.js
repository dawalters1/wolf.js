import BaseEvent from './baseEvent.js';

class GroupAudioCountUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio slot update');
  }

  async process (data) {
    const channel = this.client.channel.store.get(data.id);

    if (channel === null) { return; }

    if (channel.audioSlotStore === null) { return; }

    const oldChannelAudioSlot = channel.audioSlotStore.get(data.slot.id);

    if (oldChannelAudioSlot === null) { return; }

    this.client.emit(
      'channelAudioSlotUpdate',
      oldChannelAudioSlot.clone(),
      oldChannelAudioSlot.patch(data)
    );
  }
}

export default GroupAudioCountUpdateEvent;
