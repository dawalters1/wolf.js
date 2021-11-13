const { events } = require('../../../../constants');

module.exports = async (api, body) => {
  return api.emit(body.isGroup ? events.GROUP_TIP_ADD : events.PRIVATE_TIP_ADD, body);
};
