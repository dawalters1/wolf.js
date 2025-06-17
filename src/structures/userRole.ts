import BaseEntity from './baseEntity';
import WOLF from '../client/WOLF';

export type ServerUserRole = {
    roleId: number;
    groupIdList: Set<number>;
}

export class UserRole extends BaseEntity {
  roleId: number;
  channelIdList: Set<number>;

  constructor (client: WOLF, data: ServerUserRole) {
    super(client);

    this.roleId = data.roleId;
    this.channelIdList = new Set(data.groupIdList);
  }

  patch (entity: ServerUserRole): this {
    this.roleId = entity.roleId;
    this.channelIdList = new Set(entity.groupIdList);

    return this;
  }
}

export default UserRole;
