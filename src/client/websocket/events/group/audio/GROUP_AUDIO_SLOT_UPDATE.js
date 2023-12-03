import { patch } from '../../../../../utils/index.js';
import { Event, ServerEvent } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import Base from '../../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */
class GroupAudioSlotUpdate extends Base {
  constructor (client) {
    super(client, ServerEvent.GROUP_AUDIO_SLOT_UPDATE);
  }

  async process (body) {
    const channel = this.client.channel.channels.find((group) => group.id === body.id);

    if (!channel || !channel.slots) { return false; }

    const cached = new models.ChannelAudioSlot(this.client, channel.slots.find((slot) => slot.id === body.slot.id), channel.id);

    patch(channel.slots.find((slot) => slot.id === body.slot.id), body.slot);

    if (cached.reservedOccupierId && !body.slot.reservedOccupierId) {
      return (new Date(cached.reservedExpiresAt).getTime() >= Date.now()
        ? [Event.GROUP_AUDIO_REQUEST_EXPIRE, Event.CHANNEL_AUDIO_REQUEST_EXPIRE]
        : [Event.GROUP_AUDIO_REQUEST_DELETE, Event.CHANNEL_AUDIO_REQUEST_DELETE])
        .forEach((event) =>
          this.client.emit(
            event,
            channel,
            new models.ChannelAudioSlotRequest(this.client,
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
          this.client.emit(
            event,
            channel,
            new models.ChannelAudioSlotRequest(this.client,
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
        this.client.emit(
          event,
          cached,
          new models.ChannelAudioSlotUpdate(this.client,
            {
              id: body.id,
              slot: channel.slots.find((slot) => slot.id === body.slot.id),
              sourceSubscriberId: body.sourceSubscriberId
            }
          )
        )
      );
  };
}
export default GroupAudioSlotUpdate;
