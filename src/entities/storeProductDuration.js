import BaseEntity from './baseEntity.js';

class StoreProductDuration extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.credits = entity.credits;
    this.days = entity.days;
  }
}

export default StoreProductDuration;
