import BaseEntity from './BaseEntity.js';
import NotificationAdditionalInfo from './NotificationAdditionalInfo.js';

export default class Notification extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.additionalInfo = new NotificationAdditionalInfo(client, entity.additionalInfo);
  }
}
