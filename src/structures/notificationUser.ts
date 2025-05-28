import WOLF from '../client/WOLF.ts';
import Base from './base.ts';
import NotificationUserType, { ServerNotificationUserType } from './notificationUserType.ts';

export interface ServerNotificationUser {
    context: string;
    createdAt: Date;
    expiresAt: Date;
    feed: ServerNotificationUserType;
    id: number;
    notificationId: number;
    presentationType: number;
    typeId: number;
}

export class NotificationUser extends Base {
  context: string;
  createdAt: Date;
  expiresAt: Date;
  feed: NotificationUserType;
  id: number;
  notificationId: number;
  presentationType: number;
  typeId: number;

  constructor (client: WOLF, data: ServerNotificationUser) {
    super(client);

    this.context = data.context;
    this.createdAt = data.createdAt;
    this.expiresAt = data.expiresAt;
    this.feed = new NotificationUserType(client, data.feed);
    this.id = data.id;
    this.notificationId = data.notificationId;
    this.presentationType = data.presentationType;
    this.typeId = data.typeId;
  }
}

export default NotificationUser;
