import Base from './Base.js';

class StageClientDurationUpdate extends Base {
  constructor (client, data) {
    super(client);

    this.targetChannelId = data?.targetChannelId;
    this.targetGroupId = this.targetChannelId;
    this.sourceSubscriberId = data?.sourceSubscriberId;
  }

  async leave () {
    return await this.client.stage.slot.leave(this.targetChannelId, await this.client.stage.getSlotId(this.targetChannelId));
  }

  async stop () {
    return await this.client.stage.stop(this.targetChannelId);
  }

  async play (data) {
    return await this.client.stage.play(this.targetChannelId, data);
  }

  async pause () {
    return await this.client.stage.pause(this.targetChannelId);
  }

  async resume () {
    return await this.client.stage.resume(this.targetChannelId);
  }

  async getBroadcastState () {
    return await this.client.stage.getBroadcastState(this.targetChannelId);
  }

  async isPlaying () {
    return await this.client.stage.isPlaying(this.targetChannelId);
  }

  async isPaused () {
    return await this.client.stage.isPaused(this.targetChannelId);
  }

  async isReady () {
    return await this.client.stage.isReady(this.targetChannelId);
  }

  async isIdle () {
    return await this.client.stage.isIdle(this.targetChannelId);
  }

  async duration () {
    return await this.client.stage.duration(this.targetChannelId);
  }

  async getSlotId () {
    return await this.client.stage.getSlotId(this.targetChannelId);
  }
}

export default StageClientDurationUpdate;
