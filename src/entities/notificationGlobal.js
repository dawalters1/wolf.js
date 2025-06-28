import BaseEntity from './baseEntity.js';

import NotificationGlobalFeed from './notificationGlobalFeed.js';
import NotificationGlobalPopup from './notificationGlobalPopup.js';

export class NotificationGlobal extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.context = entity.context;
    this.createdAt = new Date(entity.createdAt);
    this.expiresAt = new Date(entity.expiresAt);
    this.feed = entity.feed
      ? new NotificationGlobalFeed(client, entity.feed)
      : undefined;
    this.popup = entity.popup
      ? new NotificationGlobalPopup(client, entity.popup)
      : undefined;
    this.id = entity.id;
    this.notificationId = entity.notificationId;
    this.presentationType = entity.presentationType;
    this.typeId = entity.typeId;
  }

  patch (entity) {
    this.context = entity.context;
    this.createdAt = new Date(entity.createdAt);
    this.expiresAt = new Date(entity.expiresAt);
    this.feed = entity.feed
      ? this.feed
        ? this.feed.patch(entity.feed)
        : new NotificationGlobalFeed(this.client, entity.feed)
      : undefined;
    this.popup = entity.popup
      ? this.popup
        ? this.popup.patch(entity.popup)
        : new NotificationGlobalPopup(this.client, entity.popup)
      : undefined;
    this.id = entity.id;
    this.notificationId = entity.notificationId;
    this.presentationType = entity.presentationType;
    this.typeId = entity.typeId;

    return this;
  }
}
export default NotificationGlobal;
