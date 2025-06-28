import BaseEvent from './baseEvent.js';
import EventSubscription from '../../../entities/eventSubscription.js';

class SubscriberContactAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber group event add');
  }

  async process (data) {
    this.client.emit(
      'userChannelEventSubscriptionAdd',

      this.client.event.subscription.cache.set(
        new EventSubscription(
          this.client,
          data
        )
      )
    );
  }
}

export default SubscriberContactAddEvent;
