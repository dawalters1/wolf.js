import BaseEntity from './baseEntity.js';

export class ChannelRoleUser extends BaseEntity {
    constructor (client, entity) {
    super(client);

    if ('additionalInfo' in entity) {
      this.userId = entity.additionalInfo.subscriberId;
      this.roleId = entity.additionalInfo.roleId;
      this.channelId = entity.id;
    } else {
      this.userId = entity.subscriberId;
      this.channelId = entity.groupId;
      this.roleId = entity.roleId;
    }
  }

  /** @internal */
  patch (entity) {
    if ('additionalInfo' in entity) {
      this.userId = entity.additionalInfo.subscriberId;
      this.roleId = entity.additionalInfo.roleId;
      this.channelId = entity.id;
    } else {
      this.userId = entity.subscriberId;
      this.channelId = entity.groupId;
      this.roleId = entity.roleId;
    }

    return this;
  }
}

export default ChannelRoleUser;
