import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class SubscriberNotificationListAdd extends Base {
  constructor (client) {
    super(client, ServerEvent.SUBSCRIBER_NOTIFICATION_LIST_ADD);
  }

  async process (body) {
    const notification = await this.client.notification.subscriber.getById(body.id, this.client.utility.toLanguageId(this.client.config.framework.language));

    return this.client.emit(
      Event.SUBSCRIBER_NOTIFICATION_LIST_ADD,
      notification
    );
  };
}
export default SubscriberNotificationListAdd;
