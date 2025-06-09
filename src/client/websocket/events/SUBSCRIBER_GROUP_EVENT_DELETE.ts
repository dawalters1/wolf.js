import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerSubscriberGroupEventDelete {
    id: number;
}

class SubscriberContactDeleteEvent extends BaseEvent<ServerSubscriberGroupEventDelete> {
  constructor (client: WOLF) {
    super(client, 'subscriber group event delete');
  }

  async process (data: ServerSubscriberGroupEventDelete) {
    const wasDeleted = this.client.event.subscription.cache.delete(data.id);

    if (wasDeleted === false) { return; }

    this.client.emit(
      'userChannelEventSubscriptionDelete',
      data.id
    );
  }
}

export default SubscriberContactDeleteEvent;
