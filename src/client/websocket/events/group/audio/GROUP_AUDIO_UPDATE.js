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

  const oldAudioConfig = new models.GroupAudioCount(client, group.audioConfig);
  group.audioConfig = new models.GroupAudioCount(client, body);

  return client.emit(
    Event.GROUP_AUDIO_UPDATE,
    oldAudioConfig,
    group.audioConfig
  );
};
