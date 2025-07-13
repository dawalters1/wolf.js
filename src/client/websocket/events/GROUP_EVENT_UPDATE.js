import BaseEvent from './baseEvent.js';

class GroupEventUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group event update');
  }

  async process (data) {
    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; }

    if (!channel._events._fetched) { return; }

    const event = channel._events.get(data.id);

    if (event === null) { return; } // this shouldn't happen

    const newEvent = await this.client.event.getById(data.id, { forceNew: true });

    if (newEvent.isRemoved) {
      channel._events.delete(data.id);

      return this.client.emit(
        'channelEventDelete',
        data.id
      );
    }

    const oldEvent = event.clone();

    this.client.emit(
      'channelEventUpdate',
      oldEvent,
      event.patch(
        {
          id: data.id,
          additionalInfo: {
            startsAt: newEvent.startsAt,
            endsAt: newEvent.endsAt,
            eTag: data.eTag
          }
        }
      )
    );
  }
}

export default GroupEventUpdateEvent;
