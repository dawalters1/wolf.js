import Base from './Base.js';

class ChannelAudioSlot extends Base {
  constructor (client, data, channelId) {
    super(client);

    this.id = data?.id;
    this.channelId = channelId;
    this.groupId = this.channelId;
    this.locked = data?.locked;
    this.occupierId = data?.occupierId;
    this.occupierMuted = data?.occupierMuted;
    this.uuid = data?.uuid;
    this.connectionState = data?.connectionState;
    this.reservedOccupierId = data?.reservedOccupierId;
    this.reservedExpiresAt = data?.reservedExpiresAt;
  }

  /**
   * Join the slot
   * @returns {Promise<Response>}
   */
  async join () {
    return await this.client.stage.slot.join(this.channelId, this.id);
  }

  /**
   * Leave the slot
   * @returns {Promise<Response>}
   */
  async leave () {
    return await this.client.stage.slot.leave(this.channelId, this.id);
  }

  /**
   * Kick the slot
   * @returns {Promise<Response>}
   */
  async kick () {
    return await this.client.stage.slot.kick(this.channelId, this.id);
  }

  /**
   * Mute the slot
   * @returns {Promise<Response>}
   */
  async mute () {
    return await this.client.stage.slot.mute(this.channelId, this.id);
  }

  /**
   * Unmute the slot
   * @returns {Promise<Response>}
   */
  async unmute () {
    return await this.client.stage.slot.unmute(this.channelId, this.id);
  }

  /**
   * Lock the slot
   * @returns {Promise<Response>}
   */
  async lock () {
    return await this.client.stage.slot.lock(this.channelId, this.id);
  }

  /**
   * Unlock the slot
   * @returns {Promise<Response>}
   */
  async unlock () {
    return await this.client.stage.slot.unlock(this.channelId, this.id);
  }

  /**
   * Request a slot for the bot or specified subscriber
   * @param {Number | undefined} subscriberId
   * @returns {Promise<Response>}
   */
  async request (subscriberId) {
    return await this.client.stage.request.add(this.channelId, this.id, subscriberId);
  }

  /**
   * Cancel the audio slot
   * @returns {Promise<Response>}
   */
  async cancelRequet () {
    return await this.client.stage.request.delete(this.channelId, this.id);
  }
}

export default ChannelAudioSlot;
