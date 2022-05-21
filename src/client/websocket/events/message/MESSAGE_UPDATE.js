const { Event } = require('../../../../constants');
const models = require('../../../../models');

/**
 * @param {import('../../../WOLF')} client
 */
module.exports = async (client, body) => {
  return client.emit(
    body.isGroup ? Event.GROUP_MESSAGE_UPDATE : Event.PRIVATE_MESSAGE_UPDATE,
    new models.Message(client, body)
  );
};
