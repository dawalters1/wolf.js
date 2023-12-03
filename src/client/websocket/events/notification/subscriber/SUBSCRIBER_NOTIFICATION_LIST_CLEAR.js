import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class SubscriberNotificationListClear extends Base {
  constructor (client) {
    super(client, ServerEvent.SUBSCRIBER_NOTIFICATION_LIST_CLEAR);
  }

  async process (body) {
    this.client.notification.subscriber._list = [];

    return this.client.emit(Event.SUBSCRIBER_NOTIFICATION_LIST_CLEAR);
  };
}
export default SubscriberNotificationListClear;
