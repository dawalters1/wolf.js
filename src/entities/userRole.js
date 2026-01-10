import BaseEntity from './BaseEntity.js';

export default class UserRole extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.roleId = entity.roleId;
    this.channelIdList = new Set(entity.groupIdList);
  }
}
