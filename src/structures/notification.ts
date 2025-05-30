import WOLF from '../client/WOLF.ts';
import { key } from '../decorators/key.ts';
import Base from './base.ts';
import NotificationAdditionalInfo, { ServerNotificationAdditionalInfo } from './notificationAdditionalInfo.ts';

export interface ServerNotification {
  id: number;
  additionalInfo: ServerNotificationAdditionalInfo
}

export class Notification extends Base {
  @key
    id: number;

  additionalInfo: NotificationAdditionalInfo;

  constructor (client: WOLF, data: ServerNotification) {
    super(client);

    this.id = data.id;
    this.additionalInfo = new NotificationAdditionalInfo(client, data.additionalInfo);
  }
}

export default Notification;
