const { Events } = require('../../../../constants');

module.exports = async (api, body) => {
  const group = api.group()._groups.find((group) => group.id === body.groupId);

  if (!group || !group.stageRequestList) {
    return Promise.resolve();
  }

  group.stageRequestList = [];

  return api.emit(
    Events.GROUP_AUDIO_REQUEST_CLEAR,
    group
  );
};
