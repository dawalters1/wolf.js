
module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const group = api.group()._groups.find((group) => group.id === body.id);

  if (!group) {
    return Promise.resolve();
  }

  const cached = group.audioCounts;

  group.audioCounts = data;

  return api.emit(
    command,
    {
      old: cached,
      new: data
    }
  );
};