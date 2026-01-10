import BaseEvent from './BaseEvent.js';
import ChannelEvent from '../../../entities/ChannelEvent.js';

export default class GroupEventCreateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group event create');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return; }

    const event = new ChannelEvent(this.client, data);
    channel.eventStore.set(event);

    return this.client.emit(
      'channelEventCreated',
      channel,
      event
    );
  }
}
