const { events } = require('../../../../constants');

module.exports = async (api, body) => {
  return api.emit(events.TIP_ADD, body);
};
