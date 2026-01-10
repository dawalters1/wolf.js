import BaseEntity from './BaseEntity.js';

export default class ChannelStatsTop extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.nickname = entity.nickname;
    this.randomQuote = entity.randomQuote;
    this.userId = entity.subId;
    this.wordsPerLine = entity.wpl;
    this.value = entity.value;
    this.percentage = entity.percentage;
  }
}
