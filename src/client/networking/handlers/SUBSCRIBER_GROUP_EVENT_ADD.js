module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const event = await api.event().getById(body.id);

  api.event()._subscriptions.push(event);

  return await api.emit(
    command,
    event
  );
};
