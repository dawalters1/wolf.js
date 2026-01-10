import BaseEntity from './BaseEntity.js';

export default class ChannelAudioSlotReservation extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.reservedOccupierId;
    this.expiresAt = new Date(entity.reservedExpiresAt);
  }
}
