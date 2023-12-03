import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class SubscriberNotificationListDelete extends Base {
  constructor (client) {
    super(client, ServerEvent.SUBSCRIBER_NOTIFICATION_LIST_DELETE);
  }

  async process (body) {
    const notification = this.client.notification.subscriber.notifications.find((notification) => notification.id === body.id);

    if (!notification) { return false; }

    this.client.notification.subscriber.notifications = this.client.notification.subscriber.notifications.filter((notification) => notification.id !== body.id);
    this.client.notification.subscriber._list = this.client.notification.subscriber._list.filter((id) => id !== body.id);

    return this.client.emit(
      Event.SUBSCRIBER_NOTIFICATION_LIST_DELETE,
      notification
    );
  };
}
export default SubscriberNotificationListDelete;
