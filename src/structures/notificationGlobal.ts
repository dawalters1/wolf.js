import WOLF from '../client/WOLF.ts';
import { key } from '../decorators/key.ts';
import NotificationGlobalFeed, { ServerNotificationGlobalFeed } from './notificationGlobalFeed.ts';
import NotificationGlobalPopup, { ServerNotificationGlobalPopup } from './notificationGlobalPopup.ts';
import BaseEntity from './baseEntity.ts';

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
  feed: NotificationGlobalFeed;
  popup?: ServerNotificationGlobalPopup;
  notificationId: number;
  presentationType: number;
  typeId: number;

  constructor (client: WOLF, data: ServerNotificationGlobal) {
    super(client);

    this.context = data.context;
    this.createdAt = data.createdAt;
    this.expiresAt = data.expiresAt;
    this.feed = new NotificationGlobalFeed(client, data.feed);
    this.popup = data.popup
      ? new NotificationGlobalPopup(client, data.popup)
      : undefined;
    this.id = data.id;
    this.notificationId = data.notificationId;
    this.presentationType = data.presentationType;
    this.typeId = data.typeId;
  }
}

export default NotificationGlobal;
