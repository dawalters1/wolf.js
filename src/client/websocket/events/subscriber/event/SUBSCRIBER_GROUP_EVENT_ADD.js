const { Event } = require('../../../../../constants');

/**
 * @param {import('../../../../WOLF')} client
 */
module.exports = async (client, body) => {
  const event = await client.event.getById(body.id);

  client.event.subscription.cache.push(event);

  return client.emit(
    Event.SUBSCRIBER_GROUP_EVENT_ADD,
    event
  );
};
