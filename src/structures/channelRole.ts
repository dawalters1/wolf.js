import BaseEntity from './baseEntity';
import { key } from '../decorators/key';
import WOLF from '../client/WOLF';

export type ServerGroupRole = {
    roleId: number;
    subscriberIdList: Set<number>;
    maxSeats: number;
}

export class ChannelRole extends BaseEntity {
  @key
    roleId: number;

  userIdList: Set<number>;
  maxSeats: number;

  constructor (client: WOLF, data: ServerGroupRole) {
    super(client);

    this.roleId = data.roleId;
    this.userIdList = new Set(data.subscriberIdList);
    this.maxSeats = data.maxSeats;
  }

  patch (entity: ServerGroupRole): this {
    this.roleId = entity.roleId;
    this.userIdList = new Set(entity.subscriberIdList);
    this.maxSeats = entity.maxSeats;

    return this;
  }
}

export default ChannelRole;
