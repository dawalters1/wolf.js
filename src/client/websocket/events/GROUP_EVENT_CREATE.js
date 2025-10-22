import BaseEvent from './baseEvent.js';
import ChannelEvent from '../../../entities/channelEvent.js';

class GroupEventCreateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group event create');
  }

  async process (data) {
    const channel = this.client.channel.store.get(data.groupId);

    if (channel === null) { return; }

    if (!channel.eventStore.fetched) { return; }

    this.client.emit(
      'channelEventCreate',
      channel.eventStore.set(
        new ChannelEvent(this.client, data)
      )
    );
  }
}

export default GroupEventCreateEvent;
