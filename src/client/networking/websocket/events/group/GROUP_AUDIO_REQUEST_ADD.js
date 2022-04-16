const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const group = api._group._groups.find((group) => group.id === body.groupId);

  if (!group || !group.stageRequestList) {
    return Promise.resolve();
  }

  group.stageRequestList.push(body);

  return api.emit(
    Events.GROUP_AUDIO_REQUEST_ADD,
    group,
    {
      reservedOccupierId: body.subscriberId,
      reservedExpiresAt: body.expiresAt
    }
  );
};
