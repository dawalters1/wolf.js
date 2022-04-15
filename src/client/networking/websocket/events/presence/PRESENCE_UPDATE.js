const { Events } = require('../../../../../constants');
const patch = require('../../../../../utils/Patch');

module.exports = async (api, body) => {
  const groups = await api.group()._groups.filter((group) => group.subscribers && group.subscribers.some((subscriber) => subscriber.id === body.id));

  groups.forEach(group => {
    const subscriber = group.subscribers.find((subscriber) => subscriber.id === body.id);

    if (subscriber) {
      patch(subscriber.additionalInfo, body);
    }
  });

  const contact = await api.contact()._contacts.find((contact) => contact.id === body.id);

  if (contact) {
    patch(contact.additionalInfo, body);
  }

  const blocked = api.blocked()._blocked.find((blocked) => blocked.id === body.id);

  if (blocked) {
    patch(blocked.additionalInfo, body);
  }

  const subscriber = api.subscriber()._subscribers.find((subscriber) => subscriber.id === body.id);

  if (subscriber) {
    patch(subscriber, body);
  }

  api.subscriber()._processPresence(body, true);

  return await api.emit(
    Events.PRESENCE_UPDATE,
    body
  );
};
