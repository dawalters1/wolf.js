const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const group = api._group._groups.find((group) => group.id === body.groupId);

  if (!group) {
    return Promise.resolve();
  }

  return api.emit(
    Events.GROUP_EVENT_CREATE,
    group,
    await api._event.getById(body.id)
  );
};
