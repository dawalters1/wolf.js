import BaseEntity from './baseEntity.js';

export class CharmSummary extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.charmId = entity.charmId;
    this.expireTime = entity.expireTime
      ? new Date(entity.expireTime)
      : null;
    this.giftCount = entity.giftCount;
    this.total = entity.total;
  }

  patch (entity) {
    this.charmId = entity.charmId;
    this.expireTime = entity?.expireTime
      ? new Date(entity.expireTime)
      : null;
    this.giftCount = entity.giftCount;
    this.total = entity.total;

    return this;
  }
}

export default CharmSummary;
