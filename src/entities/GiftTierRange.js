import BaseEntity from './BaseEntity.js';

export default class GiftTierRange extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.min = entity.min;
    this.max = entity.max;
  }
}
