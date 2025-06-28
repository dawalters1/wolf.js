import BaseEvent from './baseEvent.js';

class GroupAudioRequestAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio request clear');
  }

  async process (data) {
    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; }

    if (channel._audioSlotRequests.size() === 0) { return; }

    channel._audioSlotRequests.clear();

    this.client.emit(
      'channelAudioSlotRequestClear'
    );
  }
}

export default GroupAudioRequestAddEvent;
