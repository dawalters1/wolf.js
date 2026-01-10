import BaseEntity from './BaseEntity.js';

export default class Search extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.hash = entity.hash;
    this.type = entity.type;
    this.reason = entity.reason;
  }
}
