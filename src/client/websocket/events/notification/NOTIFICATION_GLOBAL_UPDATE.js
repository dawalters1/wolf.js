import { Event } from '../../../../constants/index.js';

/**
 * @param {import('../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const cached = client.notification.cache;
  const newData = await client.notification.list(true);

  const oldIds = cached.map((notification) => notification.id);
  const newNotifications = newData.filter((notification) => !oldIds.includes(notification.id));

  return newNotifications.map((notification) =>
    client.emit(
      Event.NOTIFICATION_RECEIVED,
      notification
    )
  );
};
