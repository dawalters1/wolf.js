import BaseEntity from './baseEntity';
import { key } from '../decorators/key';
import { ServerGroupRoleSubscriberAssign } from '../client/websocket/events/GROUP_ROLE_SUBSCRIBER_ASSIGN';
import WOLF from '../client/WOLF';

export type ServerGroupRoleUser = {
    subscriberId: number;
    groupId: number;
    roleId: number;
}

export class ChannelRoleUser extends BaseEntity {
  @key
    userId: number;

  channelId: number;
  roleId: number;

  constructor (client: WOLF, data: ServerGroupRoleUser | ServerGroupRoleSubscriberAssign) {
    super(client);

    if ('additionalInfo' in data) {
      this.userId = data.additionalInfo.subscriberId;
      this.roleId = data.additionalInfo.roleId;
      this.channelId = data.id;
    } else {
      this.userId = data.subscriberId;
      this.channelId = data.groupId;
      this.roleId = data.roleId;
    }
  }

  patch (entity: ServerGroupRoleUser | ServerGroupRoleSubscriberAssign): this {
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
