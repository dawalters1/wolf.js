import BaseEntity from './baseEntity';
import { key } from '../decorators/key';
import WOLF from '../client/WOLF';

export interface ServerChannelRoleUser {
    subscriberId: number;
    groupId: number;
    roleId: number;
}

export class ChannelRoleUser extends BaseEntity {
  @key
    userId: number;

  channelId: number;
  roleId: number;

  constructor (client: WOLF, data: ServerChannelRoleUser) {
    super(client);

    this.userId = data.subscriberId;
    this.channelId = data.groupId;
    this.roleId = data.roleId;
  }

  patch (entity: any): this {
    return this;
  }
}

export default ChannelRoleUser;
