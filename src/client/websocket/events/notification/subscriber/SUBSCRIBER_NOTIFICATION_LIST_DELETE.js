import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const notification = client.notification.subscriber.notifications.find((notification) => notification.id === body.id);

  if (!notification) {
    return Promise.resolve();
  }

  client.notification.subscriber.notifications = client.notification.subscriber.notifications.filter((notification) => notification.id !== body.id);
  client.notification.subscriber._list = client.notification.subscriber._list.filter((id) => id !== body.id);

  return client.emit(
    Event.SUBSCRIBER_NOTIFICATION_LIST_DELETE,
    notification
  );
};
