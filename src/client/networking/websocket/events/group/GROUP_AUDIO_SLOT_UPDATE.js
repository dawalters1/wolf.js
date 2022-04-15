const { Events } = require('../../../../../constants');

module.exports = async (api, body) => {
  const group = api.group()._groups.find((group) => group.id === body.id);

  if (!group || !group.slots || group.slots.length === 0) {
    return Promise.resolve();
  }

  const cached = Object.assign({}, group.slots[body.slot.id - 1]);

  group.slots[body.slot.id - 1] = body.slot;

  if (cached.reservedOccupierId && !body.slot.reservedOccupierId) {
    api.emit(
      new Date(cached.reservedExpiresAt).getTime() >= Date.now() ? Events.GROUP_AUDIO_REQUEST_EXPIRE : Events.GROUP_AUDIO_REQUEST_DELETE,
      group,
      {
        slotId: body.slot.id,
        reservedOccupierId: body.slot.reservedOccupierId
      }
    );
  }

  if (!cached.reservedOccupierId && body.slot.reservedOccupierId) {
    api.emit(
      Events.GROUP_AUDIO_REQUEST_ADD,
      group,
      {
        slotId: body.slot.id,
        reservedOccupierId: body.slot.reservedOccupierId,
        reservedExpiresAt: new Date(body.slot.reservedExpiresAt)
      }
    );
  }

  return api.emit(
    Events.GROUP_AUDIO_SLOT_UPDATE,
    cached,
    body
  );
};
