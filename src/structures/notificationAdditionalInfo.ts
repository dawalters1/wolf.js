import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerNotificationAdditionalInfo {
  createdAt: Date;
  eTag: string;
}

export class NotificationAdditionalInfo extends BaseEntity {
  createdAt: Date;
  eTag: string;

  constructor (client: WOLF, data: ServerNotificationAdditionalInfo) {
    super(client);

    this.createdAt = data.createdAt;
    this.eTag = data.eTag;
  }
}
export default NotificationAdditionalInfo;
