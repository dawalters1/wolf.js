import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import NotificationGlobalFeed, { ServerNotificationGlobalFeed } from './notificationGlobalFeed.ts';
import NotificationGlobalPopup, { ServerNotificationGlobalPopup } from './notificationGlobalPopup.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerNotificationGlobal {
  context: string;
  createdAt: Date;
  expiresAt: Date;
  feed: ServerNotificationGlobalFeed;
  popup?: ServerNotificationGlobalPopup;
  id: number;
  notificationId: number;
  presentationType: number;
  typeId: number;
}

export class NotificationGlobal extends BaseEntity {
  @key
    id: number;

  context: string;
  createdAt: Date;
  expiresAt: Date;
  feed?: NotificationGlobalFeed;
  popup?: NotificationGlobalPopup;
  notificationId: number;
  presentationType: number;
  typeId: number;

  constructor (client: WOLF, data: ServerNotificationGlobal) {
    super(client);

    this.context = data.context;
    this.createdAt = new Date(data.createdAt);
    this.expiresAt = new Date(data.expiresAt);
    this.feed = data.feed
      ? new NotificationGlobalFeed(client, data.feed)
      : undefined;
    this.popup = data.popup
      ? new NotificationGlobalPopup(client, data.popup)
      : undefined;
    this.id = data.id;
    this.notificationId = data.notificationId;
    this.presentationType = data.presentationType;
    this.typeId = data.typeId;
  }

  patch (entity: ServerNotificationGlobal): this {
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
