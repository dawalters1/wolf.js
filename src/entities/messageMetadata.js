import BaseEntity from './BaseEntity.js';
import MessageMetadataFormatting from './MessageMetadataFormatting.js';

export default class MessageMetadata extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.formatting = entity.formatting
      ? new MessageMetadataFormatting(client, entity.formatting)
      : null;

    this.isDeleted = entity.isDeleted || false;
    this.isEdited = entity.isEdited || false;
    this.isSpam = entity.isSpam || false;
    this.isTipped = entity.isTipped || false;
  }
}
