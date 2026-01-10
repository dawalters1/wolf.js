
import BaseEntity from './baseEntity.js';
import IdHash from './idHash.js';

export class TipLeaderboardItem extends BaseEntity {
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

export default TipLeaderboardItem;
