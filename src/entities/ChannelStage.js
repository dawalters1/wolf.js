import BaseEntity from './BaseEntity.js';

export default class ChannelStage extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.expireTime = entity.expireTime
      ? new Date(entity.expireTime)
      : null;
  }
}
