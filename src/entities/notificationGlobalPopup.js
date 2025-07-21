import BaseEntity from './baseEntity.js';

export class NotificationGlobalPopup extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.title = entity.title;
    this.languageId = entity.languageId;
    this.body = entity.body;
    this.imageUrl = entity.imageUrl;
    this.link = entity.link;
    this.dismissText = entity.dismissText;
    this.linkText = entity.linkText;
    this.priority = entity.priority;
  }

  /** @internal */
  patch (entity) {
    this.languageId = entity.languageId;
    this.title = entity.title;
    this.body = entity.body;
    this.imageUrl = entity.imageUrl;
    this.link = entity.link;
    this.dismissText = entity.dismissText;
    this.linkText = entity.linkText;
    this.priority = entity.priority;

    return this;
  }
}
export default NotificationGlobalPopup;
