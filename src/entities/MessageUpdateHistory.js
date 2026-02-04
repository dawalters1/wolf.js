import BaseEntity from './BaseEntity.js';
import MessageMetadata from './MessageMetadata.js';

export default class MessageUpdateHistory extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.userId = entity.subscriberId;
    this.timestamp = entity.timestamp;
    this.data = entity.data.toString().trim() || '';
    this.metadata = entity.metadata
      ? new MessageMetadata(client, entity.metadata)
      : null;
  }
}
