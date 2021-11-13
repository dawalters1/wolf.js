const { Events } = require('../../../../constants');
const Message = require('../../../../models/MessageObject');

module.exports = async (api, body) => {
  return api.emit(
    body.isGroup ? Events.GROUP_MESSAGE_UPDATE : Events.PRIVATE_MESSAGE_UPDATE,
    new Message(api, body)
  );
};
