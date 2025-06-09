import BaseEvent from './baseEvent';
import EventSubscription from '../../../structures/eventSubscription';
import { ServerGroupEvent } from '../../../structures/channelEvent';
import WOLF from '../../WOLF';

interface ServerSubscriberGroupEventAdd extends ServerGroupEvent {
    groupId: number;
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
