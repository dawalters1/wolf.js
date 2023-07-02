import { Event } from '../../../../../constants/index.js';
import models, { ChannelAudioSlotUpdate } from '../../../../../models/index.js';
import patch from '../../../../../utils/patch.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const channel = client.channel.channels.find((group) => group.id === body.id);

  if (!channel || !channel.slots) {
    return Promise.resolve();
  }

  const cached = new models.ChannelAudioSlot(client, channel.slots.find((slot) => slot.id === body.slot.id), channel.id);

  patch(channel.slots.find((slot) => slot.id === body.slot.id), body.slot);

  if (cached.reservedOccupierId && !body.slot.reservedOccupierId) {
    return (new Date(cached.reservedExpiresAt).getTime() >= Date.now()
      ? [Event.GROUP_AUDIO_REQUEST_EXPIRE, Event.CHANNEL_AUDIO_REQUEST_EXPIRE]
      : [Event.GROUP_AUDIO_REQUEST_DELETE, Event.CHANNEL_AUDIO_REQUEST_DELETE])
      .forEach((event) =>
        client.emit(
          event,
          channel,
          new models.ChannelAudioSlotRequest(client,
            {
              slotId: body.slot.id,
              reservedOccupierId: body.slot.reservedOccupierId
            }
          )
        )
      );
  }

  if (!cached.reservedOccupierId && body.slot.reservedOccupierId) {
    return [Event.GROUP_AUDIO_REQUEST_ADD, Event.CHANNEL_AUDIO_REQUEST_ADD]
      .forEach((event) =>
        client.emit(
          event,
          channel,
          new models.ChannelAudioSlotRequest(client,
            {
              slotId: body.slot.id,
              reservedOccupierId: body.slot.reservedOccupierId,
              reservedExpiresAt: new Date(body.slot.reservedExpiresAt)
            }
          )
        )
      );
  }

  return [Event.GROUP_AUDIO_SLOT_UPDATE, Event.CHANNEL_AUDIO_SLOT_UPDATE]
    .forEach((event) =>
      client.emit(
        event,
        cached,
        new ChannelAudioSlotUpdate(client,
          {
            id: body.id,
            slot: channel.slots.find((slot) => slot.id === body.slot.id)
          }
        )
      )
    );
};
