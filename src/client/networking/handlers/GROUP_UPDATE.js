
module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const group = api.group()._groups.find((group) => group.id === body.id);

  if (!group || group.hash === data.hash) {
    return Promise.resolve();
  }

  return api.emit(
    command,
    {
      old: group,
      new: await api.group().getById(body.id, true)
    }
  );
};
