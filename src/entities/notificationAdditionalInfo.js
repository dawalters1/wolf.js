import BaseEntity from './baseEntity.js';

export class NotificationAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.createdAt = new Date(entity.createdAt ?? Date.now());
    this.eTag = entity.eTag;
  }
}
export default NotificationAdditionalInfo;
