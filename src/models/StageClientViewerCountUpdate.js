import Base from './Base.js';

class StageClientViewerCountUpdate extends Base {
  constructor (client, data) {
    super(client);

    this.targetGroupId = data?.targetGroupId;
    this.oldBroadcasterCount = data?.oldBroadcasterCount;
    this.newBroadcasterCount = data?.newBroadcasterCount;
    this.newConsumerCount = data?.newConsumerCount;
    this.oldConsumerCount = data?.oldConsumerCount;
  }

  async leave () {
    return await this.client.stage.slot.leave(this.targetGroupId, await this.client.stage.getSlotId(this.targetGroupId));
  }

  async stop () {
    return await this.client.stage.stop(this.targetGroupId);
  }

  async play (data) {
    return await this.client.stage.play(this.targetGroupId, data);
  }

  async pause () {
    return await this.client.stage.pause(this.targetGroupId);
  }

  async resume () {
    return await this.client.stage.resume(this.targetGroupId);
  }

  async getBroadcastState () {
    return await this.client.stage.getBroadcastState(this.targetGroupId);
  }

  async isPlaying () {
    return await this.client.stage.isPlaying(this.targetGroupId);
  }

  async isPaused () {
    return await this.client.stage.isPaused(this.targetGroupId);
  }

  async isReady () {
    return await this.client.stage.isReady(this.targetGroupId);
  }

  async isIdle () {
    return await this.client.stage.isIdle(this.targetGroupId);
  }

  async duration () {
    return await this.client.stage.duration(this.targetGroupId);
  }

  async getSlotId () {
    return await this.client.stage.getSlotId(this.targetGroupId);
  }
}

export default StageClientViewerCountUpdate;
