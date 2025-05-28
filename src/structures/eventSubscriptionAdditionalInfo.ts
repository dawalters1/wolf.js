import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerEventSubscriptionAdditionalInfo {
    eTag: string;
    endsAt: Date;
    startsAt: Date;
}

export class EventSubscriptionAdditionalInfo extends Base {
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
