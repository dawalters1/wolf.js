const { Event } = require('../../../../../constants');
const models = require('../../../../../models');

/**
 * @param {import('../../../../WOLF')} client
 */
module.exports = async (client, body) => {
  const group = client.group.cache.find((group) => group.id === body.groupId);

  if (!group) {
    return Promise.resolve();
  }

  const cached = group.audioRequests.find((request) => request.subscriberId === body.subscriberId);

  if (!cached) {
    return Promise.resolve();
  }

  const request = new models.GroupAudioRequest(client, body);

  group.audioRequests.splice(group.audioRequests.indexOf(request), 1);

  return client.emit(
    new Date(cached.reservedExpiresAt).getTime() >= Date.now() ? Event.GROUP_AUDIO_REQUEST_EXPIRE : Event.GROUP_AUDIO_REQUEST_DELETE,
    group,
    request
  );
};
