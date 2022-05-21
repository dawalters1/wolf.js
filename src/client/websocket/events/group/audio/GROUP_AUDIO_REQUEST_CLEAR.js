const { Event } = require('../../../../../constants');

/**
 * @param {import('../../../../WOLF')} client
 */
module.exports = async (client, body) => {
  const group = client.group.cache.find((group) => group.id === body.groupId);

  if (!group) {
    return Promise.resolve();
  }

  group.audioRequests = [];

  return client.emit(
    Event.GROUP_AUDIO_REQUEST_CLEAR,
    group,
    body.subscriberId
  );
};