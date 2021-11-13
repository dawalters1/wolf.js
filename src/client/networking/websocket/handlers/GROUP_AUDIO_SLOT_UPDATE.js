const { Events } = require('../../../../constants');

module.exports = async (api, body) => {
  const group = api.group()._groups.find((group) => group.id === body.id);

  if (!group) {
    return Promise.resolve();
  }

  const cached = group.slots[body.slot.id];

  group.slots[body.slot.id] = body.slot;

  return api.emit(
    Events.GROUP_AUDIO_SLOT_UPDATE,
    cached,
    body
  );
};
