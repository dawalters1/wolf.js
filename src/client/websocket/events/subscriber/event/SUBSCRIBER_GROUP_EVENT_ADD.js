import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class SubscriberGroupEventAdd extends Base {
  constructor (client) {
    super(client, ServerEvent.SUBSCRIBER_GROUP_EVENT_ADD);
  }

  async process (body) {
    const newEvent = await this.client.event.getById(body.id);

    this.client.event.subscription.subscriptions.push(newEvent);

    return [Event.SUBSCRIBER_GROUP_EVENT_ADD, Event.SUBSCRIBER_CHANNEL_EVENT_ADD]
      .forEach((event) =>
        this.client.emit(
          event,
          newEvent
        )
      );
  };
}

export default SubscriberGroupEventAdd;
