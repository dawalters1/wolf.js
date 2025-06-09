import BaseEntity from './baseEntity.ts';
import ChannelEventAdditionalInfo, { ServerGroupEventAdditonalInfo } from './channelEventAdditionalInfo.ts';
import { key } from '../decorators/key.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerGroupEvent {
  id: number;
  additionalInfo: ServerGroupEventAdditonalInfo
}

export class ChannelEvent extends BaseEntity {
  @key
    id: number;

  additonalInfo: ChannelEventAdditionalInfo;

  constructor (client: WOLF, data: ServerGroupEvent) {
    super(client);

    this.id = data.id;
    this.additonalInfo = new ChannelEventAdditionalInfo(client, data.additionalInfo);
  }

  patch (entity: ServerGroupEvent): this {
    this.id = entity.id;
    this.additonalInfo = this.additonalInfo.patch(entity.additionalInfo);
    return this;
  }
}
export default ChannelEvent;
