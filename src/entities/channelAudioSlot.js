import BaseEntity from './baseEntity.js';
import ChannelAudioSlotReservation from './channelAudioSlotReservation.js';

export class ChannelAudioSlot extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
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

  patch (entity) {
    const data = 'slot' in entity ? entity.slot : entity;

    this.id = data.id;
    this.isLocked = data.locked;
    this.isMuted = data.occupierMuted;
    this.userId = data.occupierId;
    this.isReserved = data.reservedOccupierId !== undefined;

    this.reservation = this.reservation
      ? data.reservedOccupierId
        ? this.reservation.patch(data)
        : undefined
      : data.reservedOccupierId
        ? new ChannelAudioSlotReservation(this.client, entity)
        : undefined;

    this.connectionState = data.connectionState;
    this.uuid = data.uuid;
    this.isOccupied = data.occupierId !== null || this.reservation !== undefined;

    return this;
  }
}

export default ChannelAudioSlot;
