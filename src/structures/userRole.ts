import BaseEntity from './baseEntity';
import WOLF from '../client/WOLF';

export interface ServerUserRole {
    roleId: number;
    groupIdList: Set<number>;
}

export class UserRole extends BaseEntity {
  roleId: number;
  channelIdList: Set<number>;

  constructor (client: WOLF, data: ServerUserRole) {
    super(client);

    this.roleId = data.roleId;
    this.channelIdList = data.groupIdList;
  }

  patch (entity: any): this {
    return this;
  }
}

export default UserRole;
