const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const blocked = api.blocked()._blocked.find((blocked) => blocked.id === body.targetId);

  if (blocked) {
    api.blocked()._blocked.splice(api.blocked()._blocked.indexOf(blocked), 1);
  }

  return await api.emit(
    Events.SUBSCRIBER_BLOCK_DELETE,
    blocked
  );
};
