import BaseEntity from './BaseEntity.js';

export default class ChannelRoleUser extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.additionalInfo?.subscriberId ?? entity.subscriberId;
    this.channelId = entity?.id ?? entity.groupId;
    this.roleId = entity.additionalInfo?.roleId ?? entity.roleId;
  }

  async unassign (userId) {
    return this.client.channel.roles.unassign(this.channelId, userId, this.roleId);
  }
}
