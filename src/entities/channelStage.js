import BaseEntity from './baseEntity.js';

export class ChannelStage extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.expireTime = entity.expireTime
      ? new Date(entity.expireTime)
      : null;
  }
}

export default ChannelStage;
