const { Events } = require('../../../../constants');

module.exports = async (api, body) => {
  return api.emit(body.isGroup ? Events.GROUP_TIP_ADD : Events.PRIVATE_TIP_ADD, body);
};
