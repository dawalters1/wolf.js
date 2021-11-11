const { events } = require('../../../../constants');
const Message = require('../../../../models/MessageObject');

module.exports = async (api, body) => {
  return api.emit(
    body.isGroup ? events.GROUP_MESSAGE_UPDATE : events.PRIVATE_MESSAGE_UPDATE,
    new Message(api, body)
  );
};
