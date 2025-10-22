import BaseEvent from './baseEvent.js';

class GroupAudioRequestAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio request clear');
  }

  async process (data) {
    const channel = this.client.channel.store.get(data.groupId);

    if (channel === null) { return; }

    if (channel.audioSlotRequestStore.size() === 0) { return; }

    channel.audioSlotRequestStore.clear();

    this.client.emit(
      'channelAudioSlotRequestClear'
    );
  }
}

export default GroupAudioRequestAddEvent;
