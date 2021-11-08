
module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const group = api.group()._groups.find((group) => group.id === body.id);

  if (!group || group.hash === body.hash) {
    return Promise.resolve();
  }

  api.on._emit(command, await api.group().getById(body.id, true));

  return api.emit(
    command,
    {
      old: group,
      new: await api.group().getById(body.id)
    }
  );
};
