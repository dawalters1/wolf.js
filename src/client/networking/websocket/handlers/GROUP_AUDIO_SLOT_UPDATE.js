
module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const group = api.group()._groups.find((group) => group.id === body.id);

  if (!group) {
    return Promise.resolve();
  }

  const cached = group.slots[body.slot.id];

  group.slots[data.slot.id] = body.slot;

  api.on._emit(command, cached, body);

  return api.emit(
    command,
    {
      old: cached,
      new: body
    }
  );
};
