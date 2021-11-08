module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const event = api.event()._subscriptions.find((event) => event.id === body.id);

  if (event) {
    api.event()._subscriptions.splice(api.event()._subscriptions.indexOf(event), 1);
  }

  api.on._emit(command, event);

  return await api.emit(
    command,
    event
  );
};
