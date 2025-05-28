import WOLF from '../client/WOLF.ts';
import Base from './base.ts';
import NotificationGlobalType, { ServerNotificationGlobalType } from './notificationGlobalType.ts';

export interface ServerNotificationGlobal {
    context: string;
    createdAt: Date;
    expiresAt: Date;
    feed: ServerNotificationGlobalType;
    id: number;
    notificationId: number;
    presentationType: number;
    typeId: number;
}

export class NotificationGlobal extends Base {
  context: string;
  createdAt: Date;
  expiresAt: Date;
  feed: NotificationGlobalType;
  id: number;
  notificationId: number;
  presentationType: number;
  typeId: number;

  constructor (client: WOLF, data: ServerNotificationGlobal) {
    super(client);

    this.context = data.context;
    this.createdAt = data.createdAt;
    this.expiresAt = data.expiresAt;
    this.feed = new NotificationGlobalType(client, data.feed);
    this.id = data.id;
    this.notificationId = data.notificationId;
    this.presentationType = data.presentationType;
    this.typeId = data.typeId;
  }
}

export default NotificationGlobal;
