import { Event } from '../../../../../constants/index.js';

export default async (client, body) => {
  const contact = await client.contact.contacts.find((contact) => contact.id === body.targetId);

  if (!contact) {
    return Promise.resolve();
  }

  client.contact.contacts = client.contact.contacts.filter((blocked) => blocked.id !== body.targetId);

  return await client.emit(
    Event.SUBSCRIBER_CONTACT_DELETE,
    contact
  );
};
