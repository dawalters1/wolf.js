import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const event = await client.event.getById(body.id);

  client.event.subscription.subscriptions.push(event);

  return client.emit(
    Event.SUBSCRIBER_GROUP_EVENT_ADD,
    event
  );
};
