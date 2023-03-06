import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const cached = await client.event.subscription.subscriptions.find((event) => event.id === body.id);

  if (!cached) {
    return Promise.resolve();
  }

  client.event.subscription.subscriptions.splice(client.event.subscription.subscriptions.indexOf(cached), 1);

  return client.emit(
    Event.SUBSCRIBER_GROUP_EVENT_DELETE,
    cached
  );
};
