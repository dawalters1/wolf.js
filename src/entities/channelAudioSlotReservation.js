import BaseEntity from './baseEntity.js';

class ChannelAudioSlotReservation extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.reservedOccupierId;
    this.expiresAt = new Date(entity.reservedExpiresAt);
  }

  patch (entity) {
    this.userId = entity.reservedOccupierId;
    this.expiresAt = new Date(entity.reservedExpiresAt);

    return this;
  }
}

export default ChannelAudioSlotReservation;
