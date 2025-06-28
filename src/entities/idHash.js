import BaseEntity from './baseEntity.js';

export class IdHash extends BaseEntity {
  constructor (client, entity, isChannel = false) {
    super(client);
    this.id = entity.id;
    this.hash = entity.hash;
    this.isChannel = isChannel;
  }

  patch (entity) {
    this.id = entity.id;
    this.hash = entity.hash;
    return this;
  }
}

export default IdHash;
