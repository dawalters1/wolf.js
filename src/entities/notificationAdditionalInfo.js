import BaseEntity from './baseEntity.js';

export class NotificationAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.createdAt = new Date(entity.createdAt ?? Date.now());
    this.eTag = entity.eTag;
  }

  patch (entity) {
    this.createdAt = new Date(entity.createdAt);
    this.eTag = entity.eTag;

    return this;
  }
}
export default NotificationAdditionalInfo;
