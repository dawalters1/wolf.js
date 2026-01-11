import BaseEntity from './BaseEntity.js';
import ChannelAudioSlotReservation from './ChannelAudioSlotReservation.js';

export class ChannelAudioSlot extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.channelId = entity.groupId;
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

export default ChannelAudioSlot;
