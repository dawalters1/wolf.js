const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const event = await api.event().getById(body.id);

  api.event()._subscriptions.push(event);

  return await api.emit(
    Events.SUBSCRIBER_GROUP_EVENT_ADD,
    event
  );
};
