import Base from './Base.js';

class GroupAudioSlot extends Base {
  constructor (client, data, targetGroupId) {
    super(client);

    this.id = data?.id;
    this.groupId = targetGroupId;
    this.locked = data?.locked;
    this.occupierId = data?.occupierId;
    this.occupierMuted = data?.occupierMuted;
    this.uuid = data?.uuid;
    this.connectionState = data?.connectionState;
    this.reservedOccupierId = data?.reservedOccupierId;
    this.reservedExpiresAt = data?.reservedExpiresAt;
  }

  async join () {
    return await this.client.stage.slot.join(this.groupId, this.id);
  }

  async leave () {
    return await this.client.stage.slot.leave(this.groupId, this.id);
  }

  async kick () {
    return await this.client.stage.slot.kick(this.groupId, this.id);
  }

  async mute () {
    return await this.client.stage.slot.mute(this.groupId, this.id);
  }

  async unmute () {
    return await this.client.stage.slot.unmute(this.groupId, this.id);
  }

  async lock () {
    return await this.client.stage.slot.lock(this.groupId, this.id);
  }

  async unlock () {
    return await this.client.stage.slot.unlock(this.groupId, this.id);
  }

  async request (subscriberId) {
    return await this.client.stage.request.add(this.groupId, this.id, subscriberId);
  }

  async cancelRequet () {
    return await this.client.stage.request.delete(this.groupId, this.id);
  }
}

export default GroupAudioSlot;
