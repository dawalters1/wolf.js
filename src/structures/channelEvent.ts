import WOLF from '../client/WOLF.ts';
import Base from './base.ts';
import ChannelEventAdditionalInfo, { ServerChannelEventAdditonalInfo } from './channelEventAdditionalInfo.ts';

export interface ServerChannelEvent {
    id: number;
    additionalInfo: ServerChannelEventAdditonalInfo
}

export class ChannelEvent extends Base {
  id: number;
  additonalInfo: ChannelEventAdditionalInfo;

  constructor (client: WOLF, data: ServerChannelEvent) {
    super(client);

    this.id = data.id;
    this.additonalInfo = new ChannelEventAdditionalInfo(client, data.additionalInfo);
  }
}

export default ChannelEvent;
