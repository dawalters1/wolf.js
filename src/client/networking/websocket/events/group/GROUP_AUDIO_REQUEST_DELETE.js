const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const group = api.group()._groups.find((group) => group.id === body.groupId);

  if (!group || !group.stageRequestList) {
    return Promise.resolve();
  }

  const cached = group.stageRequestList.find((request) => request.subscriberId === body.subscriberId);

  group.stageRequestList.splice(group.stageRequestList.findIndex((request) => request.subscriberId === body.subscriberId), 1);

  return api.emit(
    new Date(cached.reservedExpiresAt).getTime() >= Date.now() ? Events.GROUP_AUDIO_REQUEST_EXPIRE : Events.GROUP_AUDIO_REQUEST_DELETE,
    group,
    {
      reservedOccupierId: body.reservedOccupierId
    }
  );
};
