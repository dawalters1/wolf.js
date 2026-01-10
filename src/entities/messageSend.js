import BaseEntity from './BaseEntity.js';

export default class MessageSend extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.uuid = entity.uuid;
    this.timestamp = entity.timestamp;
    this.slowModeRateInSeconds = entity.slowModeRateInSeconds ?? null;
  }
}
