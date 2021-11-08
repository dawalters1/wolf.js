
module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const group = await api.group().getById(body.groupId);
  const event = api.event()._events.find((event) => event.id === body.id);

  api.on._emit(command, event);

  return api.emit(
    command,
    {
      group,
      event: {
        old: event,
        new: await api.event().getById(body.id)
      }
    }
  );
};
