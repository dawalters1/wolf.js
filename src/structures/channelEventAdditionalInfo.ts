import WOLF from '../client/WOLF.ts';
import BaseEntity from './baseEntity.ts';

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
    this.endsAt = data.endsAt;
    this.startsAt = data.startsAt;
  }
}

export default ChannelEventAdditionalInfo;
