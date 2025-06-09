import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerGroupEventAdditonalInfo {
  eTag: string;
  endsAt: Date;
  startsAt: Date;
}

export class ChannelEventAdditionalInfo extends BaseEntity {
  eTag: string;
  endsAt: Date;
  startsAt: Date;

  constructor (client: WOLF, data: ServerGroupEventAdditonalInfo) {
    super(client);

    this.eTag = data.eTag;
    this.endsAt = new Date(data.endsAt);
    this.startsAt = new Date(data.startsAt);
  }

  patch (entity: ServerGroupEventAdditonalInfo): this {
    this.eTag = entity.eTag;
    this.endsAt = new Date(entity.endsAt);
    this.startsAt = new Date(entity.startsAt);

    return this;
  }
}
export default ChannelEventAdditionalInfo;
