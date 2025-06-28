import BaseEntity from './baseEntity.js';

class StoreProductImage extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.url = entity.url;
  }
}

export default StoreProductImage;
