
module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const group = api.group()._groups.find((group) => group.id === body.id);

  if (!group) {
    return Promise.resolve();
  }

  const cached = group.slots[data.slot.id];

  group.slots[data.slot.id] = data.slot;

  return api.emit(
    command,
    {
      old: cached,
      new: data
    }
  );
};
