import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  client.notification.global._list = [];

  return client.emit(Event.GLOBAL_NOTIFICATION_LIST_CLEAR);
};
