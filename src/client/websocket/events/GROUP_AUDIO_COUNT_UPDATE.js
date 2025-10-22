import BaseEvent from './baseEvent.js';

class GroupAudioCountUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio count update');
  }

  async process (data) {
    const channel = this.client.channel.store.get(data.id);

    if (channel === null) { return; }

    if (channel.audioCount === null) { return; }

    const oldChannelAudioCount = channel.audioCount.clone();

    this.client.emit(
      'channelAudioCountUpdate',
      oldChannelAudioCount,
      channel.audioCount?.patch(data)
    );
  }
}

export default GroupAudioCountUpdateEvent;
