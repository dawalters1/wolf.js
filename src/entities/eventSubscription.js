import BaseEntity from './baseEntity.js';
import EventSubscriptionAdditionalInfo from './eventSubscriptionAdditionalInfo.js';

export class EventSubscription extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.groupId = entity.groupId;
    this.additionalInfo = new EventSubscriptionAdditionalInfo(client, entity.additionalInfo);
  }
}
export default EventSubscription;
