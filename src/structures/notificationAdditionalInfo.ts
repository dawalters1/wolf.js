import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export type ServerNotificationAdditionalInfo = {
  createdAt: Date;
  eTag: string;
}

export class NotificationAdditionalInfo extends BaseEntity {
  createdAt: Date;
  eTag: string;

  constructor (client: WOLF, data: ServerNotificationAdditionalInfo) {
    super(client);

    this.createdAt = new Date(data.createdAt ?? Date.now());
    this.eTag = data.eTag;
  }

  patch (entity: ServerNotificationAdditionalInfo): this {
    this.createdAt = new Date(entity.createdAt);
    this.eTag = entity.eTag;

    return this;
  }
}
export default NotificationAdditionalInfo;
