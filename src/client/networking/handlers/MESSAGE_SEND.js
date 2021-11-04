const Message = require('../../../models/Message');

module.exports = async (api, data) => {
  const command = data.command;
  const body = data.body;

  const message = new Message(api, body);

  // TODO: Process mimeType

  return await api.emit(
    command,
    message
  );
};
