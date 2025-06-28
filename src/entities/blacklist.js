import BaseEntity from './baseEntity.js';

export class Blacklist extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.id = entity.id;
    this.regex = entity.regex;
  }
}

export default Blacklist;
