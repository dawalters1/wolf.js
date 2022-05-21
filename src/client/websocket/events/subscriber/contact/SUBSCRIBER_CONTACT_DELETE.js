const { Event } = require('../../../../../constants');
/**
 *
 * @param {import('../../../../WOLF')} client
 * @param {*} body
 * @returns
 */
module.exports = async (client, body) => {
  const contact = await client.contact.cache.find((subscriber) => subscriber.id === body.targetId);

  if (!contact) {
    return Promise.resolve();
  }

  client.contact.cache.splice(client.contact.cache.indexOf(contact), 1);

  return await client.emit(
    Event.SUBSCRIBER_CONTACT_DELETE,
    contact
  );
};
