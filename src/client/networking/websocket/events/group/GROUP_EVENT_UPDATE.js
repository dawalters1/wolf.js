const GroupEventObject = require('../../../../../models/GroupEventObject');
const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const group = await api._group.getById(body.groupId);
  const event = api._event._events.find((event) => event.id === body.id);

  if (body.isRemoved) {
    return api.emit(
      Events.GROUP_EVENT_DELETED,
      group,
      await api._event.getById(body.id, true)
    );
  }

  return api.emit(
    Events.GROUP_EVENT_UPDATE,
    group,
    new GroupEventObject(api, Object.assign({}, event)),
    await api._event.getById(body.id, true)
  );
};
