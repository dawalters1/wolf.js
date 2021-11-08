const patch = require('../../../utils/patch');

module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  let subscriber = await api.subscriber()._subscribers.find((subscriber) => subscriber.id === body.id);

  if (!subscriber || subscriber.hash === body.hash) {
    return Promise.resolve();
  }
  const old = subscriber;

  subscriber = await api.subscriber().getById(body.id, true);

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

  api.on._emit(command, subscriber);

  return api.emit(
    command,
    {
      old,
      new: subscriber
    }
  );
};
