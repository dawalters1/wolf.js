import BaseEntity from './BaseEntity.js';

export default class Link extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.start = entity.index;
    this.end = this.start + entity[0].length;
    this.link = entity[0];
  }
}
