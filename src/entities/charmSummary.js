import BaseEntity from './BaseEntity.js';

export default class CharmSummary extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.charmId = entity.charmId;
    this.expireTime = entity.expireTime
      ? new Date(entity.expireTime)
      : null;
    this.giftCount = entity.giftCount;
    this.total = entity.total;
  }
}
