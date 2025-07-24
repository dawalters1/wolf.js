import BaseEntity from './baseEntity.js';

class Metadata extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.description = entity.description;
    this.domain = entity.domain;
    this.imageSize = entity.imageSize;
    this.imageUrl = entity.imageUrl;
    this.isOfficial = entity.isOfficial;
    this.title = entity.title;
  }
}

export default Metadata;
