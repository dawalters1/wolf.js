import BaseEvent from './baseEvent.js';

class SubscriberContactDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber group event delete');
  }

  async process (data) {
    const wasDeleted = this.client.event.subscription.cache.delete(data.id);

    if (wasDeleted === false) { return; }

    this.client.emit(
      'userChannelEventSubscriptionDelete',
      data.id
    );
  }
}

export default SubscriberContactDeleteEvent;
