const GroupObject = require('../../../../../models/GroupObject');
const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const group = api.group()._groups.find((group) => group.id === body.id);

  if (!group || group.hash === body.hash) {
    return Promise.resolve();
  }

  return api.emit(
    Events.GROUP_UPDATE,
    new GroupObject(api, Object.assign({}, group)),
    await api.group().getById(body.id, true)
  );
};
