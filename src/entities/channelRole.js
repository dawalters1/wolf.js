import BaseEntity from './baseEntity.js';

export class ChannelRole extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.roleId = entity.roleId;
    this.userIdList = new Set(entity.subscriberIdList);
    this.maxSeats = entity.maxSeats;
  }
}

export default ChannelRole;
