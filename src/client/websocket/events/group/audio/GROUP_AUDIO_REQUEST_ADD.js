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

  const request = new models.GroupAudioSlotRequest(client, body);

  group.audioRequests.push(request);

  return client.emit(
    Event.GROUP_AUDIO_REQUEST_ADD,
    group,
    request
  );
};
