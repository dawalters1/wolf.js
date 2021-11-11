const { events } = require('../../../../constants');

module.exports = async (api, body) => {
  const group = await api.group().getById(body.groupId);
  const event = api.event()._events.find((event) => event.id === body.id);

  return api.emit(
    events.GROUP_EVENT_UPDATE,
    {
      group,
      event: {
        old: event,
        new: await api.event().getById(body.id)
      }
    }
  );
};
