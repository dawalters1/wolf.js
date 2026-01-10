import BaseEvent from './BaseEvent.js';
import ChannelEvent from '../../../entities/ChannelEvent.js';

export default class GroupEventUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group event update');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return; }

    const oldEvent = channel.eventStore.get((item) => item.id === data.id);

    const { isRemoved } = await this.client.event.fetch(data.id, { forceNew: true });

    if (isRemoved) {
      channel.eventStore.delete((item) => item.id === data.id);

      return this.client.emit(
        'channelEventDeleted',
        channel,
        oldEvent
      );
    }

    const event = new ChannelEvent(this.client, data);
    channel.eventStore.set(event);

    return this.client.emit(
      'channelEventUpdated',
      channel,
      oldEvent,
      event
    );
  }
}
