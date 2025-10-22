import BaseEntity from './baseEntity.js';
import ChannelEventAdditionalInfo from './channelEventAdditionalInfo.js';

export class ChannelEvent extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.additionalInfo = new ChannelEventAdditionalInfo(client, entity.additionalInfo);
  }

  async get () {

  }
}

export default ChannelEvent;
