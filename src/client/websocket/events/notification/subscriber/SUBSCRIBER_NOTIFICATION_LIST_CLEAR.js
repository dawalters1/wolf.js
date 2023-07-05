import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  client.notification.subscriber._list = [];

  return client.emit(Event.SUBSCRIBER_NOTIFICATION_LIST_CLEAR);
};
