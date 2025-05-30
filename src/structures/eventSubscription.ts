import WOLF from '../client/WOLF.ts';
import { key } from '../decorators/key.ts';
import BaseEntity from './baseEntity.ts';
import EventSubscriptionAdditionalInfo, { ServerEventSubscriptionAdditionalInfo } from './eventSubscriptionAdditionalInfo.ts';

export interface ServerEventSubscription {
  id: number;
  groupId: number;
  additionalInfo: ServerEventSubscriptionAdditionalInfo;
}

export class EventSubscription extends BaseEntity {
  @key
    id: number;

  groupId: number;
  additionalInfo: EventSubscriptionAdditionalInfo;

  constructor (client: WOLF, data: ServerEventSubscription) {
    super(client);

    this.id = data.id;
    this.groupId = data.groupId;
    this.additionalInfo = new EventSubscriptionAdditionalInfo(client, data.additionalInfo);
  }
}

export default EventSubscription;
