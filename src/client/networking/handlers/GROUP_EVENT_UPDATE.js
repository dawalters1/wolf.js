
module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const group = api.group()._groups.find((group) => group.id === body.groupId);

  if (!group) {
    return Promise.resolve();
  }

  const cached = group.events.find((event) => event.id === body.id);

  const event = await api.event().getById(body.id);

  group.events.splice(group.event.indexOf(cached), 1, event);

  return api.emit(
    command,
    {
      group,
      event: {
        old: cached,
        new: event
      }
    }
  );
};
