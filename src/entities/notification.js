import BaseEntity from './baseEntity.js';

import NotificationAdditionalInfo from './notificationAdditionalInfo.js';

export class Notification extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.additionalInfo = new NotificationAdditionalInfo(client, entity.additionalInfo);
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.additionalInfo = this.additionalInfo.patch(entity.additionalInfo);

    return this;
  }
}
export default Notification;
