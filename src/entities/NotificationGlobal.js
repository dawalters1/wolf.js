import BaseEntity from './BaseEntity.js';
import NotificationFeed from './NotificationFeed.js';
import NotificationPopup from './NotificationPopup.js';

export default class NotificationGlobal extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.context = entity.context;
    this.createdAt = new Date(entity.createdAt);
    this.expiresAt = new Date(entity.expiresAt);
    this.feed = entity.feed
      ? new NotificationFeed(client, entity.feed)
      : undefined;
    this.popup = entity.popup
      ? new NotificationPopup(client, entity.popup)
      : undefined;
    this.id = entity.id;
    this.notificationId = entity.notificationId;
    this.presentationType = entity.presentationType;
    this.typeId = entity.typeId;
  }
}
