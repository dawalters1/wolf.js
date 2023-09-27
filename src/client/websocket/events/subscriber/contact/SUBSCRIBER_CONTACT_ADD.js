import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const subscriber = await client.subscriber.getById(body.id, body.targetId);

  if (!subscriber.exists) { return false; }

  const contact = new models.Contact(client, subscriber);

  client.contact.contacts.push(contact);

  return client.emit(
    Event.SUBSCRIBER_CONTACT_ADD,
    contact
  );
};
