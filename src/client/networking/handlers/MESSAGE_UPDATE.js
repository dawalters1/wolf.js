const Message = require('../../../models/Message');

module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  return api.emit(
    command,
    new Message(api, body)
  );
};
