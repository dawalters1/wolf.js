
module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  api.on._emit(command, body);

  return api.emit(command, body);
};
