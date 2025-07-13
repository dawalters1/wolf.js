import BaseEvent from './baseEvent.js';
import ChannelEvent from '../../../entities/channelEvent.js';

class GroupEventCreateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group event create');
  }

  async process (data) {
    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; }

    console.log(channel._events);
    if (!channel._events._fetched) { return; }

    this.client.emit(
      'channelEventCreate',
      channel._events.set(
        new ChannelEvent(this.client, data)
      )
    );
  }
}

export default GroupEventCreateEvent;
