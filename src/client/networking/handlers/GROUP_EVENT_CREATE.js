
module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const group = api.group()._groups.find((group) => group.id === body.groupId);

  if (!group) {
    return Promise.resolve();
  }

  const event = await api.event().getById(body.id);

  group.events.push(event);

  return api.emit(
    command,
    {
      group,
      event
    }
  );
};
