import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
export default async (client, body) => {
  const subscriber = await client.subscriber.getById(body.id, body.targetId);
  if (!subscriber.exists) {
    return Promise.resolve();
  }
  const contact = new models.Contact(client, subscriber);
  client.contact.blocked.cache.push(contact);
  return await client.emit(Event.SUBSCRIBER_BLOCK_ADD, contact);
};
