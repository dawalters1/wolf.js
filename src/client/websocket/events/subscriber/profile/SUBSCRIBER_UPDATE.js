import { Event } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';

export default async (client, body) => {
  const cached = client.subscriber.cache.find((subscriber) => subscriber.id === body.id);

  if (!cached || cached.hash === body.hash) {
    return Promise.resolve();
  }

  const oldSubscriber = new models.Subscriber(client, cached);
  const newSubscriber = await client.subscriber.getById(body.id, true);

  client.contact._patchIfExists('id', newSubscriber.toContact());
  client.contact.blocked._patchIfExists('id', newSubscriber.toContact());

  return client.emit(
    Event.SUBSCRIBER_UPDATE,
    oldSubscriber,
    newSubscriber
  );
};
