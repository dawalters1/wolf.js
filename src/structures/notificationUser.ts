import WOLF from '../client/WOLF.ts';
import { key } from '../decorators/key.ts';
import NotificationUserFeed, { ServerNotificationUserFeed } from './notificationUserFeed.ts';
import NotificationUserPopup, { ServerNotificationUserPopup } from './notificationUserPopup.ts';
import BaseEntity from './baseEntity.ts';

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
  feed: NotificationUserFeed;
  popup?: NotificationUserPopup;

  notificationId: number;
  presentationType: number;
  typeId: number;

  constructor (client: WOLF, data: ServerNotificationUser) {
    super(client);

    this.context = data.context;
    this.createdAt = data.createdAt;
    this.expiresAt = data.expiresAt;
    this.feed = new NotificationUserFeed(client, data.feed);
    this.popup = data.popup
      ? new NotificationUserPopup(client, data.popup)
      : undefined;
    this.id = data.id;
    this.notificationId = data.notificationId;
    this.presentationType = data.presentationType;
    this.typeId = data.typeId;
  }
}

export default NotificationUser;
