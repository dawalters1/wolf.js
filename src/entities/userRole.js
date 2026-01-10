
import BaseEntity from './baseEntity.js';

export class UserRole extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.roleId = entity.roleId;
    this.channelIdList = new Set(entity.groupIdList);
  }
}

export default UserRole;
