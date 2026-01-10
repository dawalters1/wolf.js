import BaseEntity from './BaseEntity.js';

export default class NotificationPopup extends BaseEntity {
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
}
