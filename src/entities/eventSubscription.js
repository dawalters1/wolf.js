import BaseEntity from './BaseEntity.js';
import EventSubscriptionAdditionalInfo from './EventSubscriptionAdditionalInfo.js';

export default class EventSubscription extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.groupId = entity.groupId;
    this.additionalInfo = new EventSubscriptionAdditionalInfo(client, entity.additionalInfo);
  }
}
