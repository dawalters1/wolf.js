const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const group = api._group._groups.find((group) => group.id === body.id);

  if (!group) {
    return Promise.resolve();
  }

  const cached = Object.assign({}, group.audioCounts);

  group.audioCounts = body;

  return api.emit(
    Events.GROUP_AUDIO_COUNT_UPDATE,
    cached,
    body
  );
};
