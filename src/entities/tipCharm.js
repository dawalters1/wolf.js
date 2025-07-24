import BaseEntity from './baseEntity.js';
import IdHash from './idHash.js';

class TipCharm extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.quantity = entity.quantity ?? null;
    this.charmId = entity.charmId ?? null;
    this.credits = entity.credits ?? null;
    this.magnitude = entity.magnitude ?? null;
    this.user = entity.subscriber
      ? new IdHash(this.client, entity.subscriber)
      : null;
  }
}

export default TipCharm;
