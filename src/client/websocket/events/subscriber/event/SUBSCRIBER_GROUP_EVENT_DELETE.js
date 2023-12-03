import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class SubscriberGroupEventDelete extends Base {
  constructor (client) {
    super(client, ServerEvent.SUBSCRIBER_GROUP_EVENT_DELETE);
  }

  async process (body) {
    const cached = await this.client.event.subscription.subscriptions.find((event) => event.id === body.id);

    if (!cached) { return false; }

    this.client.event.subscription.subscriptions.splice(this.client.event.subscription.subscriptions.indexOf(cached), 1);

    return [Event.SUBSCRIBER_GROUP_EVENT_DELETE, Event.SUBSCRIBER_CHANNEL_EVENT_DELETE]
      .forEach((event) =>
        this.client.emit(
          event,
          cached
        )
      );
  };
}
export default SubscriberGroupEventDelete;
