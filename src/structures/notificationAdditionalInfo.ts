import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerNotificationAdditionalInfo {
  createdAt: Date;
  eTag: string;
}

export class NotificationAdditionalInfo extends Base {
  createdAt: Date;
  eTag: string;

  constructor (client: WOLF, data: ServerNotificationAdditionalInfo) {
    super(client);

    this.createdAt = data.createdAt;
    this.eTag = data.eTag;
  }
}

export default NotificationAdditionalInfo;
