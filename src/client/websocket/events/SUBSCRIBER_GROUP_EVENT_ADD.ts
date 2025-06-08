import BaseEvent from './baseEvent';
import EventSubscription from '../../../structures/eventSubscription';
import WOLF from '../../WOLF';

interface ServerSubscriberGroupEventAdd {
    id: number;
    groupId: number;
    additionalInfo: {
        eTag: string;
        startsAt: Date;
        endsAt: Date
    }
}

class SubscriberContactAddEvent extends BaseEvent<ServerSubscriberGroupEventAdd> {
  constructor (client: WOLF) {
    super(client, 'subscriber group event add');
  }

  async process (data: ServerSubscriberGroupEventAdd) {
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
