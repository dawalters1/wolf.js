import { Event, ServerEvent } from '../../../../../constants/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class SubscriberContactDelete extends Base {
  constructor (client) {
    super(client, ServerEvent.SUBSCRIBER_CONTACT_DELETE);
  }

  async process (body) {
    const contact = await this.client.contact.contacts.find((contact) => contact.id === body.targetId);

    if (!contact) { return false; }

    this.client.contact.contacts = this.client.contact.contacts.filter((contact) => contact.id !== body.targetId);

    return this.client.emit(
      Event.SUBSCRIBER_CONTACT_DELETE,
      contact
    );
  };
}
export default SubscriberContactDelete;
