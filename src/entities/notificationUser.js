
import BaseEntity from './baseEntity.js';
import NotificationUserFeed from './notificationUserFeed.js';
import NotificationUserPopup from './notificationUserPopup.js';

class NotificationUser extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.context = entity.context;
    this.createdAt = new Date(entity.createdAt);
    this.expiresAt = new Date(entity.expiresAt);
    this.feed = entity.feed
      ? new NotificationUserFeed(client, entity.feed)
      : undefined;
    this.popup = entity.popup
      ? new NotificationUserPopup(client, entity.popup)
      : undefined;
    this.id = entity.id;
    this.notificationId = entity.notificationId;
    this.presentationType = entity.presentationType;
    this.typeId = entity.typeId;
  }
}

export default NotificationUser;
