const { Event } = require('../../../../../constants');

/**
 * @param {import('../../../../WOLF')} client
 */
module.exports = async (client, body) => {
  const cached = await client.event.subscription.cache.find((event) => event.id === body.id);

  if (!cached) {
    return;
  }

  client.event.subscription.cache.splice(client.event.subscription.cache.indexOf(cached), 1);

  return client.emit(
    Event.SUBSCRIBER_GROUP_EVENT_DELETE,
    cached
  );
};
