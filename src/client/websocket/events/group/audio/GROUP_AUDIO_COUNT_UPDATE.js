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

  const oldAudioCount = new models.GroupAudioCount(client, group.audioCounts);
  group.audioCounts = new models.GroupAudioCount(client, body);

  return client.emit(
    Event.GROUP_AUDIO_COUNT_UPDATE,
    oldAudioCount,
    group.audioCounts
  );
};
