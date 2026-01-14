import BaseEntity from './BaseEntity.js';

export default class Link extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.start = entity.start;
    this.end = entity.end;
    this.link = entity.link;
  }
}
