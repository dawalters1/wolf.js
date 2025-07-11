import BaseEntity from './baseEntity.js';

class ChannelStatsOwner extends BaseEntity {
    constructor (client, entity) {
    super(client);

    this.level = entity.level;
    this.nickname = entity.nickname;
    this.userId = entity.subId;
  }
}

export default ChannelStatsOwner;
