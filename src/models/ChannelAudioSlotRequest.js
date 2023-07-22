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

  /**
   * Delete the audio slot request
   * @returns {Promise<Response>}
   */
  async delete () {
    return await this.client.stage.request.delete(this.channelId, this.slotId);
  }

  /**
   * Accept the audio slot request
   * @returns {Promise<Response<Object>>}
   */
  async accept () {
    return await this.client.stage.slot.join(this.channelId, this.slotId);
  }

  /**
   * Reject the audio slot request
   * @returns {Promise<Response>}
   */
  async reject () {
    return this.delete();
  }
}

export default ChannelAudioSlotRequest;
