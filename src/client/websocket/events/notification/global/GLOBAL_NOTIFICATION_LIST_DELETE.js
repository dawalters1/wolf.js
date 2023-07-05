import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const notification = await client.notification.global.notifications.find((notification) => notification.id === body.id);

  if (!notification) {
    return Promise.resolve();
  }

  client.notification.global.notifications = client.notification.global.notifications.filter((notification) => notification.id !== body.id);

  return client.emit(
    Event.GLOBAL_NOTIFICATION_LIST_DELETE,
    notification
  );
};
