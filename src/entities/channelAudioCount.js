import BaseEntity from './baseEntity.js';

export class ChannelAudioCount extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.broadcasterCount = entity.broadcasterCount;
    this.consumerCount = entity.consumerCount;
    this.id = entity.id;
  }

  patch (entity) {
    this.broadcasterCount = entity.broadcasterCount;
    this.consumerCount = entity.consumerCount;
    this.id = entity.id;

    return this;
  }
}
export default ChannelAudioCount;
