import BaseEntity from './BaseEntity.js';

export default class ChannelGiftItem extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.amount = entity.amount;
    this.charmId = entity.charmId;
    this.imageUrl = entity.imageUrl;
  }
}
