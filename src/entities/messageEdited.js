import BaseEntity from './baseEntity.js';

export class MessageEdited extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.subscriberId;
    this.timestamp = entity.timestamp;
  }
}
export default MessageEdited;
