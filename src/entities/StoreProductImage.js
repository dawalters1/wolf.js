import BaseEntity from './BaseEntity.js';

export default class StoreProductImage extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.url = entity.url;
  }
}
