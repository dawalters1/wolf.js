import { Event } from '../../../../../constants/index.js';
import models, { GroupAudioSlotUpdate } from '../../../../../models/index.js';
import patch from '../../../../../utils/patch.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const group = client.group.groups.find((group) => group.id === body.id);

  if (!group || !group.slots) {
    return Promise.resolve();
  }

  const cached = new models.GroupAudioSlot(client, group.slots.find((slot) => slot.id === body.slot.id), group.id);

  patch(group.slots.find((slot) => slot.id === body.slot.id), body.slot);

  if (cached.reservedOccupierId && !body.slot.reservedOccupierId) {
    return client.emit(
      new Date(cached.reservedExpiresAt).getTime() >= Date.now()
        ? Event.GROUP_AUDIO_REQUEST_EXPIRE
        : Event.GROUP_AUDIO_REQUEST_DELETE,
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
    return client.emit(
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
    new GroupAudioSlotUpdate(client,
      {
        id: body.id,
        slot:
        group.slots.find((slot) => slot.id === body.slot.id)
      }
    )
  );
};
