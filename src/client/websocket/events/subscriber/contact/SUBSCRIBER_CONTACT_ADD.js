import { Event, ServerEvent } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class SubscriberContactAdd extends Base {
  constructor (client) {
    super(client, ServerEvent.SUBSCRIBER_BLOCK_DELETE);
  }

  async process (body) {
    const subscriber = await this.client.subscriber.getById(body.id, body.targetId);

    if (!subscriber.exists) { return false; }

    const contact = new models.Contact(this.client, subscriber);

    this.client.contact.contacts.push(contact);

    return this.client.emit(
      Event.SUBSCRIBER_CONTACT_ADD,
      contact
    );
  };
}
export default SubscriberContactAdd;
