import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import patch from '../../../../../utils/patch.js';

/**
 *
 * @param {import('../../../../WOLF').default} client
 * @param {*} body
 * @returns
 */
export default async (client, body) => {
  const cached = client.subscriber.subscribers.find((subscriber) => subscriber.id === body.id);

  if (!cached || cached.hash === body.hash) {
    return Promise.resolve();
  }

  const oldSubscriber = new models.Subscriber(client, cached);
  const newSubscriber = await client.subscriber.getById(body.id, true, true);

  if (client.contact.contacts.some((contact) => contact.id === newSubscriber.id)) {
    patch(client.contact.contacts.find((contact) => contact.id === newSubscriber.id), newSubscriber.toContact());
  }

  if (client.contact.blocked.blocked.some((contact) => contact.id === newSubscriber.id)) {
    patch(client.contact.blocked.blocked.find((contact) => contact.id === newSubscriber.id), newSubscriber.toContact());
  }

  for (const channel of await client.channel.list()) {
    await channel.members?._onSubscriberUpdate(newSubscriber);
  }

  return client.emit(
    Event.SUBSCRIBER_UPDATE,
    oldSubscriber,
    newSubscriber
  );
};
