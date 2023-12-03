import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class SubscriberBlockDelete extends Base {
  constructor (client) {
    super(client, ServerEvent.SUBSCRIBER_BLOCK_DELETE);
  }

  async process (body) {
    const contact = this.client.contact.blocked.blocked.find((blocked) => blocked.id === body.targetId);

    if (!contact) { return false; }

    this.client.contact.blocked.blocked = this.client.contact.blocked.blocked.filter((blocked) => blocked.id !== body.targetId);

    return this.client.emit(
      Event.SUBSCRIBER_BLOCK_DELETE,
      contact
    );
  };
}
export default SubscriberBlockDelete;
