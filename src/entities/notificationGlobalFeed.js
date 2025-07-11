import BaseEntity from './baseEntity.js';

export class NotificationGlobalFeed extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.languageId = entity.languageId;
    this.title = entity.title;
    this.body = entity.body;
    this.imageUrl = entity.imageUrl;
    this.link = entity.link;
  }

  /** @internal */
  patch (entity) {
    this.languageId = entity.languageId;
    this.title = entity.title;
    this.body = entity.body;
    this.imageUrl = entity.imageUrl;
    this.link = entity.link;

    return this;
  }
}
export default NotificationGlobalFeed;
