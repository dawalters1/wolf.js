import Base from './Base.js';

class ChannelAudioSlotRequest extends Base {
  constructor (client, data) {
    super(client);
    this.slotId = data?.slotId;
    this.channelId = data?.groupId;
    this.groupId = this.channelId;

    this.reservedOccupierId = data?.reservedOccupierId;
    this.reservedExpiresAt = data?.reservedExpiresAt;
  }

  async delete () {
    return await this.client.stage.request.delete(this.channelId, this.slotId);
  }

  async accept () {
    return await this.client.stage.slot.join(this.channelId, this.slotId);
  }

  async reject () {
    return this.delete();
  }
}

export default ChannelAudioSlotRequest;
