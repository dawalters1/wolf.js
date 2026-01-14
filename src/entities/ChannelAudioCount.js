import BaseEntity from './BaseEntity.js';

export default class ChannelAudioCount extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.broadcasterCount = entity.broadcasterCount;
    this.consumerCount = entity.consumerCount;
    this.id = entity.id;
  }
}
