import BaseEntity from './BaseEntity.js';

export default class MessageMetadataFormattingUrl extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.start = entity.start;
    this.end = entity.end;
    this.url = entity.url;
  }
}
