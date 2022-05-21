const { Event } = require('../../../../constants');

/**
 * @param {import('../../../WOLF')} client
 */
module.exports = async (client, body) => {
  const cached = client.notification.cache;

  const newData = await client.notification.list(true);

  for (const notification of newData) {
    if (!cached.find((notif) => notif.id === notification.id)) {
      client.emit(
        Event.NOTIFICATION_RECEIVED,
        notification
      );
    }
  }
};
