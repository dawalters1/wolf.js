import BaseEntity from './BaseEntity.js';

export default class NotificationAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.createdAt = new Date(entity.createdAt ?? Date.now());
    this.eTag = entity.eTag;
  }
}
