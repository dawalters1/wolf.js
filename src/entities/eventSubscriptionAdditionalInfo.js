import BaseEntity from './baseEntity.js';

export class EventSubscriptionAdditionalInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.eTag = entity.eTag;
    this.endsAt = new Date(entity.endsAt);
    this.startsAt = new Date(entity.startsAt);
  }

  patch (entity) {
    this.eTag = entity.eTag;
    this.endsAt = new Date(entity.endsAt);
    this.startsAt = new Date(entity.startsAt);

    return this;
  }
}
export default EventSubscriptionAdditionalInfo;
