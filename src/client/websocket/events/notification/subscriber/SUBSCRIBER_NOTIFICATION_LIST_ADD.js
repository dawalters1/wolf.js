import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const notification = await client.notification.subscriber.getById(body.id, client.utility.toLanguageId(client.config.framework.language));

  return client.emit(
    Event.SUBSCRIBER_NOTIFICATION_LIST_ADD,
    notification
  );
};
