import Base from './Base.js';

class StageClientViewerCountUpdate extends Base {
  constructor (client, data) {
    super(client);

    this.targetChannelId = data?.targetChannelId;
    this.targetGroupId = this.targetChannelId;
    this.slotId = data?.slotId;

    this.oldBroadcasterCount = data?.oldBroadcasterCount;
    this.newBroadcasterCount = data?.newBroadcasterCount;
    this.newConsumerCount = data?.newConsumerCount;
    this.oldConsumerCount = data?.oldConsumerCount;
  }

  /**
   * Play audio on stage
   * @param {Stream} data
   * @returns {Promise<void>}
   */
  async play (data) {
    return await this.client.stage.play(this.targetChannelId, data);
  }

  /**
   * Stop playing audio on a stage (Will remain on stage)
   * @returns {Promise<void>}
   */
  async stop () {
    return await this.client.stage.stop(this.targetChannelId);
  }

  /**
   * Pause the current broadcast (Download continues in background)
   * @returns {Promise<void>}
   */
  async pause () {
    return await this.client.stage.pause(this.targetChannelId);
  }

  /**
   * Resume the current broadcast
   * @returns {Promise<void>}
   */
  async resume () {
    return await this.client.stage.resume(this.targetChannelId);
  }

  /**
   * Leave the slot that bot was on
   * @returns {Promise<Response>}
   */
  async leave () {
    return await this.client.stage.slot.leave(this.targetChannelId, this.slotId);
  }

  /**
   * Get the current broadcast state of the client for a channel
   * @returns {Promise<exports.StageBroadcastState>}
   */
  async getBroadcastState () {
    return await this.client.stage.getBroadcastState(this.targetChannelId);
  }

  /**
   * Whether or not the client for the channel is ready to broadcast
   * @returns {Promise<boolean>}
   */
  async isReady () {
    return await this.client.stage.isReady(this.targetChannelId);
  }

  /**
   * Whether or not the client for the channel is broadcasting
   * @returns {Promise<boolean>}
   */
  async isPlaying () {
    return await this.client.stage.isPlaying(this.targetChannelId);
  }

  /**
   * Whether or not the client for the channel is paused
   * @returns {Promise<boolean>}
   */
  async isPaused () {
    return await this.client.stage.isPaused(this.targetChannelId);
  }

  /**
   * Whether or not the client for the channel is idling
   * @returns {Promise<boolean>}
   */
  async isIdle () {
    return await this.client.stage.isIdle(this.targetChannelId);
  }

  /**
   * Get the duration of the current broadcast
   * @returns {Promise<Number>}
   */
  async duration () {
    return await this.client.stage.duration(this.targetChannelId);
  }

  /**
   * Get the slot the bot is on
   * @returns {Promise<Number>}
   */
  async getSlotId () {
    return await this.client.stage.getSlotId(this.targetChannelId);
  }
}

export default StageClientViewerCountUpdate;
