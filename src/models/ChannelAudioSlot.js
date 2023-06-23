import Base from './Base.js';

class ChannelAudioSlot extends Base {
  constructor (client, data, targetGroupId) {
    super(client);

    this.id = data?.id;
    this.channelId = targetGroupId;
    this.groupId = this.channelId;
    this.locked = data?.locked;
    this.occupierId = data?.occupierId;
    this.occupierMuted = data?.occupierMuted;
    this.uuid = data?.uuid;
    this.connectionState = data?.connectionState;
    this.reservedOccupierId = data?.reservedOccupierId;
    this.reservedExpiresAt = data?.reservedExpiresAt;
  }

  async join () {
    return await this.client.stage.slot.join(this.channelId, this.id);
  }

  async leave () {
    return await this.client.stage.slot.leave(this.channelId, this.id);
  }

  async kick () {
    return await this.client.stage.slot.kick(this.channelId, this.id);
  }

  async mute () {
    return await this.client.stage.slot.mute(this.channelId, this.id);
  }

  async unmute () {
    return await this.client.stage.slot.unmute(this.channelId, this.id);
  }

  async lock () {
    return await this.client.stage.slot.lock(this.channelId, this.id);
  }

  async unlock () {
    return await this.client.stage.slot.unlock(this.channelId, this.id);
  }

  async request (subscriberId) {
    return await this.client.stage.request.add(this.channelId, this.id, subscriberId);
  }

  async cancelRequet () {
    return await this.client.stage.request.delete(this.channelId, this.id);
  }
}

export default ChannelAudioSlot;
