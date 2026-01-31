import BaseEvent from './BaseEvent.js';
import EventSubscription from '../../../entities/EventSubscription.js';
export default class SubscriberGroupEventAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber group event add');
  }

  async process (data) {
    const eventSubscription = new EventSubscription(this.client, data);
    this.client.event.subscription.store.set(eventSubscription);

    return this.client.emit(
      'eventSubscriptionAdded',
      eventSubscription
    );
  }
}
