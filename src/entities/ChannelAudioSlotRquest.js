import BaseEntity from './BaseEntity.js';
import ChannelAudioSlotReservation from './ChannelAudioSlotReservation.js';

export default class ChannelAudioSlot extends BaseEntity {
  constructor (client, entity, channelId) {
    super(client);

    this.id = entity.id;
    this.channelId = channelId;
    this.isLocked = entity.locked;
    this.isMuted = entity.occupierMuted;
    this.userId = entity.occupierId;
    this.isReserved = entity.reservedOccupierId !== undefined;
    this.reservation = entity.reservedOccupierId
      ? new ChannelAudioSlotReservation(client, entity)
      : undefined;
    this.connectionState = entity.connectionState;
    this.uuid = entity.uuid;
    this.isOccupied = entity.occupierId !== null || this.reservation !== undefined;
  }
}
