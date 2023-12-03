import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GlobalNotificationListClear extends Base {
  constructor (client) {
    super(client, ServerEvent.GLOBAL_NOTIFICATION_LIST_CLEAR);
  }

  async process (body) {
    this.client.notification.global._list = [];

    return this.client.emit(Event.GLOBAL_NOTIFICATION_LIST_CLEAR);
  };
}
export default GlobalNotificationListClear;
