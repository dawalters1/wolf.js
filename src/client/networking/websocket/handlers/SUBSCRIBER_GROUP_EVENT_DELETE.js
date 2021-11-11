const { events } = require('../../../../constants');

module.exports = async (api, body) => {
  const event = api.event()._subscriptions.find((event) => event.id === body.id);

  if (event) {
    api.event()._subscriptions.splice(api.event()._subscriptions.indexOf(event), 1);
  }

  return await api.emit(
    events.SUBSCRIBER_GROUP_EVENT_DELETE,
    event
  );
};
