import BaseEntity from './BaseEntity.js';

export default class Frame extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.languageId = entity.languageId;
    this.productId = entity.productId;
    this.imageUrl = entity.imageUrl;
    this.cost = entity.cost;
    this.name = entity.name;
    this.description = entity.description;
  }
}
