const Message = require('../../../models/Message');

module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  api.on._emit(
    command,
    new Message(api, body)
  );

  return api.emit(
    command,
    new Message(api, body)
  );
};
