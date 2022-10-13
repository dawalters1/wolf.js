import { Event } from '../../../../../constants/index.js';

export default async (client, body) => {
  const contact = await client.contact.blocked.cache.find((subscriber) => subscriber.id === body.targetId);

  if (!contact) {
    return Promise.resolve();
  }
  client.contact.blocked.cache.splice(client.contact.blocked.cache.indexOf(contact), 1);

  return await client.emit(
    Event.SUBSCRIBER_BLOCK_DELETE,
    contact
  );
};
