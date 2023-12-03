import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GlobalNotificationListDelete extends Base {
  constructor (client) {
    super(client, ServerEvent.GLOBAL_NOTIFICATION_LIST_DELETE);
  }

  async process (body) {
    const notification = await this.client.notification.global.notifications.find((notification) => notification.id === body.id);

    if (!notification) { return false; }

    this.client.notification.global.notifications = this.client.notification.global.notifications.filter((notification) => notification.id !== body.id);
    this.client.notification.global._list = this.client.notification.global._list.filter((id) => id !== body.id);

    return this.client.emit(
      Event.GLOBAL_NOTIFICATION_LIST_DELETE,
      notification
    );
  };
}
export default GlobalNotificationListDelete;
