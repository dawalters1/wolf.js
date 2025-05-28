import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerChannelEventAdditonalInfo {
    eTag: string;
    endsAt: Date;
    startsAt: Date;
}

export class ChannelEventAdditionalInfo extends Base {
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
