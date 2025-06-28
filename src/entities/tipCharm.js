import BaseEntity from './baseEntity.js';
import IdHash from './idHash.js';

class TipCharm extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.quanitity = entity.quanitity; // Note: typo in "quantity" is preserved
    this.charmId = entity.charmId;
    this.credits = entity.credits;
    this.magnitude = entity.magnitude;
    this.user = new IdHash(this.client, entity.subscriber);
  }
}

export default TipCharm;
