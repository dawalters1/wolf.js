import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import NotificationUserFeed, { ServerNotificationUserFeed } from './notificationUserFeed.ts';
import NotificationUserPopup, { ServerNotificationUserPopup } from './notificationUserPopup.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerNotificationUser {
  context: string;
  createdAt: Date;
  expiresAt: Date;
  feed: ServerNotificationUserFeed;
  popup?: ServerNotificationUserPopup;
  id: number;
  notificationId: number;
  presentationType: number;
  typeId: number;
}

export class NotificationUser extends BaseEntity {
  @key
    id: number;

  context: string;
  createdAt: Date;
  expiresAt: Date;
  feed?: NotificationUserFeed;
  popup?: NotificationUserPopup;
  notificationId: number;
  presentationType: number;
  typeId: number;

  constructor (client: WOLF, data: ServerNotificationUser) {
    super(client);

    this.context = data.context;
    this.createdAt = new Date(data.createdAt);
    this.expiresAt = new Date(data.expiresAt);
    this.feed = data.feed
      ? new NotificationUserFeed(client, data.feed)
      : undefined;
    this.popup = data.popup
      ? new NotificationUserPopup(client, data.popup)
      : undefined;
    this.id = data.id;
    this.notificationId = data.notificationId;
    this.presentationType = data.presentationType;
    this.typeId = data.typeId;
  }

  patch (entity: ServerNotificationUser): this {
    this.context = entity.context;
    this.createdAt = new Date(entity.createdAt);
    this.expiresAt = new Date(entity.expiresAt);
    this.feed = entity.feed
      ? this.feed
        ? this.feed.patch(entity.feed)
        : new NotificationUserFeed(this.client, entity.feed)
      : undefined;
    this.popup = entity.popup
      ? this.popup
        ? this.popup.patch(entity.popup)
        : new NotificationUserPopup(this.client, entity.popup)
      : undefined;
    this.id = entity.id;
    this.notificationId = entity.notificationId;
    this.presentationType = entity.presentationType;
    this.typeId = entity.typeId;

    return this;
  }
}
export default NotificationUser;
