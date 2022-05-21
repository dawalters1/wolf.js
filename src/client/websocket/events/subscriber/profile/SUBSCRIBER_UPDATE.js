const { Event } = require('../../../../../constants');
const models = require('../../../../../models');

/**
 *
 * @param {import('../../../../WOLF')} client
 * @param {*} body
 * @returns
 */
module.exports = async (client, body) => {
  const cached = client.subscriber.cache.find((subscriber) => subscriber.id === body.id);

  if (!cached || cached.hash === body.hash) {
    return Promise.resolve();
  }

  const oldSubscriber = new models.Subscriber(client, cached);
  const newSubscriber = await client.subscriber.getById(body.id, true);

  if (newSubscriber.id === client.currentSubscriber.id) {
    client.currentSubscriber = newSubscriber;
  }

  // TODO: update lists (blocked, contacts, group members list) where required

  return client.emit(
    Event.SUBSCRIBER_UPDATE,
    oldSubscriber,
    newSubscriber
  );
};
