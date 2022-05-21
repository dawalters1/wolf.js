const { Event } = require('../../../../../constants');
const models = require('../../../../../models');

/**
 * @param {import('../../../../WOLF')} client
 */
module.exports = async (client, body) => {
  const subscriber = await client.subscriber.getById(body.id, body.targetId);

  if (!subscriber.exists) {
    return Promise.resolve();
  }

  const contact = new models.Contact(client, subscriber);

  client.contact.blocked.cache.push(contact);

  return await client.emit(
    Event.SUBSCRIBER_BLOCK_ADD,
    contact
  );
};
