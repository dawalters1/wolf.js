import BaseEntity from './baseEntity';
import { key } from '../decorators/key';
import WOLF from '../client/WOLF';

export interface ServerChannelRole {
    roleId: number;
    subscriberIdList: Set<number>;
    maxSeats: number;
}

export class ChannelRole extends BaseEntity {
  @key
    roleId: number;

  userIdList: Set<number>;
  maxSeats: number;

  constructor (client: WOLF, data: ServerChannelRole) {
    super(client);

    this.roleId = data.roleId;
    this.userIdList = new Set(data.subscriberIdList);
    this.maxSeats = data.maxSeats;
  }

  patch (entity: any): this {
    return this;
  }
}

export default ChannelRole;
