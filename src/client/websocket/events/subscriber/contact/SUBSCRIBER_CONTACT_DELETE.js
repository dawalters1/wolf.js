import { Event } from '../../../../../constants/index.js';

export default async (client, body) => {
  const contact = await client.contact.contacts.find((subscriber) => subscriber.id === body.targetId);

  if (!contact) {
    return Promise.resolve();
  }
  client.contact.contacts.splice(client.contact.contacts.indexOf(contact), 1);

  return await client.emit(
    Event.SUBSCRIBER_CONTACT_DELETE,
    contact
  );
};
