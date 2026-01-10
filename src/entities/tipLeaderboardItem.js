import BaseEntity from './BaseEntity.js';
import IdHash from './IdHash.js';

export default class TipLeaderboardItem extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.rank = entity.rank;
    this.charmId = entity.charmId;
    this.quantity = entity.quantity;
    this.credits = entity.credits;
    this.channel = entity.group
      ? new IdHash(this.client, entity.group, true)
      : null;
    this.user = entity.subscriber
      ? new IdHash(this.client, entity.subscriber)
      : null;
  }
}
