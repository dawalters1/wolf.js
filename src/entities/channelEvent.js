import BaseEntity from './baseEntity.js';
import ChannelEventAdditionalInfo from './channelEventAdditionalInfo.js';

export class ChannelEvent extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.additionalInfo = new ChannelEventAdditionalInfo(client, entity.additionalInfo);
  }

  patch (entity) {
    this.id = entity.id;
    this.additionalInfo = this.additionalInfo
      ? this.additionalInfo.patch(entity.additionalInfo)
      : new ChannelEventAdditionalInfo(this.client, entity.additionalInfo);
    return this;
  }
}

export default ChannelEvent;
