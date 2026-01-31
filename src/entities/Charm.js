import BaseEntity from './BaseEntity.js';

export default class Charm extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.languageId = entity.languageId;
    this.cost = entity.cost;
    this.description = entity.description;
    this.imageUrl = entity.imageUrl;
    this.name = entity.name;
    this.productId = entity.productId;
  }
}
