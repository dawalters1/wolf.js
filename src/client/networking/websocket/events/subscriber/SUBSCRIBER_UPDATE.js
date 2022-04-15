const SubscriberObject = require('../../../../../models/SubscriberObject');
const { Events } = require('../../../../../constants');
const patch = require('../../../../../utils/Patch');

module.exports = async (api, body) => {
  let subscriber = await api.subscriber()._subscribers.find((subscriber) => subscriber.id === body.id);

  if (!subscriber || subscriber.hash === body.hash) {
    return Promise.resolve();
  }

  const old = new SubscriberObject(api, Object.assign({}, subscriber));

  subscriber = await api.subscriber().getById(body.id, true);

  if (subscriber.id === api.currentSubscriber.id) {
    api._currentSubscriber = subscriber;
  }

  const groups = await api.group()._groups.filter((group) => group.subscribers && group.subscribers.some((subscriber) => subscriber.id === body.id));

  groups.forEach(group => {
    const subscriber = group.subscribers.find((subscriber) => subscriber.id === body.id);

    if (subscriber) {
      patch(subscriber.additionalInfo, subscriber);
    }
  });

  const contact = await api.contact()._contacts.find((contact) => contact.id === body.id);

  if (contact) {
    patch(contact.additionalInfo, subscriber);
  }

  const blocked = api.blocked()._blocked.find((blocked) => blocked.id === body.id);

  if (blocked) {
    patch(blocked.additionalInfo, subscriber);
  }

  return api.emit(
    Events.SUBSCRIBER_UPDATE,
    old,
    subscriber
  );
};
