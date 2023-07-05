import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const newEvent = await client.event.getById(body.id);

  client.event.subscription.subscriptions.push(newEvent);

  return [Event.SUBSCRIBER_GROUP_EVENT_ADD, Event.SUBSCRIBER_CHANNEL_EVENT_ADD]
    .forEach((event) =>
      client.emit(
        event,
        newEvent
      )
    );
};
