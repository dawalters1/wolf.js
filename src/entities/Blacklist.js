import BaseEntity from './BaseEntity.js';

export default class Blacklist extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.id = entity.id;
    this.regex = entity.regex;
  }
}
