import Base from './Base.js';

class GroupAudioSlotRequest extends Base {
  constructor (client, data) {
    super(client);
    this.slotId = data?.slotId;
    this.groupId = data?.groupId;
    this.reservedOccupierId = data?.reservedOccupierId;
    this.reservedExpiresAt = data?.reservedExpiresAt;
  }

  toJSON () {
    return {
      slotId: this.slotId,
      groupId: this.groupId,
      reservedOccupierId: this.reservedOccupierId,
      reservedExpiresAt: this.reservedExpiresAt
    };
  }
}

export default GroupAudioSlotRequest;
