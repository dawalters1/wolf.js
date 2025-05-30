import WOLF from '../client/WOLF.ts';
import BaseEntity from './baseEntity.ts';

export interface ServerEventSubscriptionAdditionalInfo {
  eTag: string;
  endsAt: Date;
  startsAt: Date;
}

export class EventSubscriptionAdditionalInfo extends BaseEntity {
  eTag: string;
  endsAt: Date;
  startsAt: Date;

  constructor (client: WOLF, data: ServerEventSubscriptionAdditionalInfo) {
    super(client);

    this.eTag = data.eTag;
    this.endsAt = data.endsAt;
    this.startsAt = data.startsAt;
  }
}

export default EventSubscriptionAdditionalInfo;
