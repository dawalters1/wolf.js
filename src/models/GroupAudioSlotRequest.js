import { Base } from './Base.js';

class GroupAudioSlotRequest extends Base {
  constructor (client, data) {
    super(client);
    this.slotId = data?.slotId;
    this.groupId = data?.groupId;
    this.reservedOccupierId = data?.reservedOccupierId;
    this.reservedExpiresAt = data?.reservedExpiresAt;
  }
}

export { GroupAudioSlotRequest };
