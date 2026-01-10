import BaseEntity from './BaseEntity.js';

export default class NotificationFeed extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.languageId = entity.languageId;
    this.title = entity.title;
    this.body = entity.body;
    this.imageUrl = entity.imageUrl;
    this.link = entity.link;
  }
}
