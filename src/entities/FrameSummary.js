import BaseEntity from './BaseEntity.js';

export default class FrameSummary extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.expireTime = entity?.expireTime
      ? new Date(entity.expireTime)
      : null;
    this.frameId = entity.frameId;
    this.giftCount = entity.giftCount;
    this.total = entity.total;
  }
}
