import Base from './Base.js';

class GroupAudioSlot extends Base {
  constructor (client, data) {
    super(client);
    console.log(data);
    this.id = data?.id;
    this.locked = data?.locked;
    this.occupierId = data?.occupierId;
    this.occupierMuted = data?.occupierMuted;
    this.uuid = data?.uuid;
    this.connectionState = data?.connectionState;
    this.reservedOccupierId = data?.reservedOccupierId;
    this.reservedExpiresAt = data?.reservedExpiresAt;
  }

  toJSON () {
    return {
      id: this.id,
      locked: this.locked,
      occupierId: this.occupierId,
      occupierMuted: this.occupierMuted,
      uuid: this.uuid,
      connectionState: this.connectionState,
      reservedOccupierId: this.reservedOccupierId,
      reservedExpiresAt: this.reservedExpiresAt
    };
  }
}

export default GroupAudioSlot;
