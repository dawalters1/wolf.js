import BaseEntity from './BaseEntity.js';

export default class ChannelRole extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.roleId = entity.roleId;
    this.channelId = entity.groupId;
    this.userIdList = new Set(entity.subscriberIdList);
    this.maxSeats = entity.maxSeats;
  }

  async assign (userId) {
    return this.client.channel.roles.assign(this.channelId, userId, this.id);
  }

  async unassign (userId) {
    return this.client.channel.roles.unassign(this.channelId, userId, this.id);
  }

  async reassign (oldUserId, newUserId) {
    return this.client.channel.roles.reassign(this.channelId, oldUserId, newUserId, this.id);
  }
}
