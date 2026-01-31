import BaseEvent from './BaseEvent.js';

export default class SubscriberGroupEventDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber group event delete');
  }

  async process (data) {
    const eventSubscription = this.client.event.subscription.store.get((item) => item.id === data.id);

    if (eventSubscription === null) { return; }

    this.client.event.subscription.store.delete((item) => item.id === data.id);

    return this.client.emit(
      'eventSubscriptionDeleted',
      eventSubscription
    );
  }
}
