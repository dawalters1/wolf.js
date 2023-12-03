import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GlobalNotificationListAdd extends Base {
  constructor (client) {
    super(client, ServerEvent.GLOBAL_NOTIFICATION_LIST_ADD);
  }

  async process (body) {
    const notification = await this.client.notification.global.getById(body.id, this.client.utility.toLanguageId(this.client.config.framework.language));

    return this.client.emit(
      Event.GLOBAL_NOTIFICATION_LIST_ADD,
      notification
    );
  };
}
export default GlobalNotificationListAdd;
