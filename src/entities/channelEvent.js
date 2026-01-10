import BaseEntity from './BaseEntity.js';
import ChannelEventAdditionalInfo from './ChannelEventAdditionalInfo.js';

export default class ChannelEvent extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.additionalInfo = new ChannelEventAdditionalInfo(client, entity.additionalInfo);
  }
}
