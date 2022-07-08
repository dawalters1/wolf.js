const { Event } = require('../../../../../constants');
const models = require('../../../../../models');
const { patch } = require('../../../../../utils');

/**
 * @param {import('../../../../WOLF')} client
 */
module.exports = async (client, body) => {
  const group = client.group.cache.find((group) => group.id === body.id);

  if (!group || !client.group.slots) {
    return Promise.resolve();
  }

  const cached = new models.GroupAudioSlot(client, group.slots.find((slot) => slot.id === body.slot.id));

  patch(group.slots.find((slot) => slot.id === body.slot.id), body.slot);

  if (cached.reservedOccupierId && !body.slot.reservedOccupierId) {
    client.emit(
      new Date(cached.reservedExpiresAt).getTime() >= Date.now() ? Event.GROUP_AUDIO_REQUEST_EXPIRE : Event.GROUP_AUDIO_REQUEST_DELETE,
      group,
      new models.GroupAudioSlotRequest(client,
        {
          slotId: body.slot.id,
          reservedOccupierId: body.slot.reservedOccupierId
        }
      )
    );
  }

  if (!cached.reservedOccupierId && body.slot.reservedOccupierId) {
    client.emit(
      Event.GROUP_AUDIO_REQUEST_ADD,
      group,
      new models.GroupAudioSlotRequest(client,
        {
          slotId: body.slot.id,
          reservedOccupierId: body.slot.reservedOccupierId,
          reservedExpiresAt: new Date(body.slot.reservedExpiresAt)
        }
      )
    );
  }

  return client.emit(
    Event.GROUP_AUDIO_SLOT_UPDATE,
    cached,
    group.slots.find((slot) => slot.id === body.slot.id)
  );
};
