import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const notification = await client.notification.subscriber.notifications.find((notification) => notification.id === body.id);

  if (!notification) {
    return Promise.resolve();
  }

  client.notification.subscriber.notifications = client.notification.subscriber.notifications.filter((notification) => notification.id !== body.id);

  return client.emit(
    Event.SUBSCRIBER_NOTIFICATION_LIST_DELETE,
    notification
  );
};
