const { Events } = require('../../../../constants');

module.exports = async (api, body) => {
  const group = api.group()._groups.find((group) => group.id === body.id);

  if (!group || !group.slots || group.slots.length === 0) {
    return Promise.resolve();
  }

  const cached = Object.assign({}, group.slots[body.slot.id]);

  group.slots[body.slot.id] = body.slot;

  if (cached.reservedOccupierId && !body.reservedOccupierId) {
    api.emit(
      cached.reservedExpiresAt >= Date.now() ? Events.GROUP_AUDIO_REQUEST_EXPIRE : Events.GROUP_AUDIO_REQUEST_DELETE,
      group,
      {
        reservedOccupierId: body.reservedOccupierId
      }
    );
  }

  if (!cached.reservedOccupierId && body.reservedOccupierId) {
    api.emit(
      Events.GROUP_AUDIO_REQUEST_ADD,
      group,
      {
        reservedOccupierId: body.reservedOccupierId,
        reservedExpiresAt: body.reservedExpiresAt
      }
    );
  }

  return api.emit(
    Events.GROUP_AUDIO_SLOT_UPDATE,
    cached,
    body
  );
};
