const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const group = api._group._groups.find((group) => group.id === body.id);

  if (!group) {
    return Promise.resolve();
  }

  const cached = Object.assign({}, group.audioConfig);

  group.audioConfig = body;

  return api.emit(
    Events.GROUP_AUDIO_UPDATE,
    cached,
    body
  );
};
