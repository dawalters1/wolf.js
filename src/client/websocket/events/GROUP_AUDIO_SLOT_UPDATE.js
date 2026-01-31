import BaseEvent from './BaseEvent.js';
import ChannelAudioSlot from '../../../entities/ChannelAudioSlot.js';
import ChannelAudioSlotRequest from '../../../entities/ChannelAudioSlotRquest.js';

export default class GroupAudioSlotUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio slot update');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return; }

    if (!channel.slotStore.fetched) { return null; }

    const sourceUser = data.sourceSubscriberId
      ? await this.client.user.fetch(data.sourceSubscriberId)
      : null;

    const slot = channel.slotStore.get((item) => item.id === data.slot.id);
    const slotOld = slot.clone();
    const slotUpdate = new ChannelAudioSlot(this.client, data.slot);
    slot.patch(slotUpdate);

    if (slot.reservation && slotUpdate.reservation === null) {
      if (!slotUpdate.isOccupied) {
        this.client.emit(
          slot.reservation.expiresAt.getTime() > Date.now()
            ? 'channelAudioSlotReservationExpired'
            : 'channelAudioSlotReservationDeleted',
          channel,
          sourceUser,
          new ChannelAudioSlotRequest(
            this.client,
            data.slot
          )
        );
      } else {
        this.client.emit(
          'channelAudioSlotReservationAccepted',
          channel,
          sourceUser,
          new ChannelAudioSlotRequest(
            this.client,
            {
              subscriberId: data.slot.occupierId,
              groupId: data.id,
              expiresAt: slot.reservation.expiresAt
            }
          )
        );
      }
    } else if (slotUpdate.reservation) {
      this.client.emit(
        'channelAudioSlotReservationAdded',
        channel,
        sourceUser,
        new ChannelAudioSlotRequest(
          this.client,
          data.slot
        )
      );
    }

    return this.client.emit(
      'channelAudioSlotUpdated',
      channel,
      sourceUser,
      slotOld,
      slotUpdate
    );
  }
}
