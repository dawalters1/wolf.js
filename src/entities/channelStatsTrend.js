import BaseEntity from './baseEntity.js';

class ChannelStatsTrend extends BaseEntity {
    constructor (client, entity) {
    super(client);

    this.day = entity.day;
    this.hour = entity.hour;
    this.lineCount = entity.lineCount;
  }
}

export default ChannelStatsTrend;
