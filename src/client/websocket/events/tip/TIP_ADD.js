const { Event } = require('../../../../constants');
const models = require('../../../../models');

module.exports = async (client, body) => {
  return client.emit(
    body.isGroup || body.groupId ? Event.GROUP_TIP_ADD : Event.PRIVATE_TIP_ADD,
    new models.Tip(client, body)
  );
};
