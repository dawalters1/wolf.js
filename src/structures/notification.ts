import BaseEntity from './baseEntity.ts';
import { key } from '../decorators/key.ts';
import NotificationAdditionalInfo, { ServerNotificationAdditionalInfo } from './notificationAdditionalInfo.ts';
import WOLF from '../client/WOLF.ts';

export type ServerNotification = {
  id: number;
  additionalInfo: ServerNotificationAdditionalInfo
}

export class Notification extends BaseEntity {
  @key
    id: number;

  additionalInfo: NotificationAdditionalInfo;

  constructor (client: WOLF, data: ServerNotification) {
    super(client);

    this.id = data.id;
    this.additionalInfo = new NotificationAdditionalInfo(client, data.additionalInfo);
  }

  patch (entity: ServerNotification): this {
    this.id = entity.id;
    this.additionalInfo = this.additionalInfo.patch(entity.additionalInfo);

    return this;
  }
}
export default Notification;
