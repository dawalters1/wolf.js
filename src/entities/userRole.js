import BaseEntity from './baseEntity.js';

export class UserRole extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.roleId = entity.roleId;
    this.channelIdList = new Set(entity.groupIdList);
  }

  patch (entity) {
    this.roleId = entity.roleId;
    this.channelIdList = new Set(entity.groupIdList);
    return this;
  }
}

export default UserRole;
