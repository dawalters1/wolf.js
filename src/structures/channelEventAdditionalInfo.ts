import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerChannelEventAdditonalInfo {
  eTag: string;
  endsAt: Date;
  startsAt: Date;
}

export class ChannelEventAdditionalInfo extends BaseEntity {
  eTag: string;
  endsAt: Date;
  startsAt: Date;

  constructor (client: WOLF, data: ServerChannelEventAdditonalInfo) {
    super(client);

    this.eTag = data.eTag;
    this.endsAt = new Date(data.endsAt);
    this.startsAt = new Date(data.startsAt);
  }

  patch (entity: any): this {
    return this;
  }
}
export default ChannelEventAdditionalInfo;
