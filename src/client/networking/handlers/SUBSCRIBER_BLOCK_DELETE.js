module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const blocked = api.blocked()._blocked.find((blocked) => blocked.id === body.targetId);

  if (blocked) {
    api.blocked()._blocked.splice(api.blocked()._blocked.indexOf(blocked), 1);
  }

  return await api.emit(
    command,
    blocked
  );
};
