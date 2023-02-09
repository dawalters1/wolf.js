import Base from './Base.js';

class GroupAudioSlotRequest extends Base {
  constructor (client, data) {
    super(client);
    this.slotId = data?.slotId;
    this.groupId = data?.groupId;
    this.reservedOccupierId = data?.reservedOccupierId;
    this.reservedExpiresAt = data?.reservedExpiresAt;
  }

  async delete () {
    return await this.client.stage.request.delete(this.groupId, this.slotId);
  }

  async accept () {
    return await this.client.stage.slot.join(this.groupId, this.slotId);
  }

  async reject () {
    return this.delete();
  }
}

export default GroupAudioSlotRequest;
