const { events } = require('../../../../constants');

module.exports = async (api, body) => {
  const group = api.group()._groups.find((group) => group.id === body.groupId);

  if (!group) {
    return Promise.resolve();
  }

  const event = await api.event().getById(body.id);

  group.events.push(event);

  return api.emit(
    events.GROUP_EVENT_CREATE,
    {
      group,
      event
    }
  );
};
