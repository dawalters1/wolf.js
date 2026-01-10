import BaseEntity from './BaseEntity.js';
import ContextType from '../constants/ContextType.js';
import MessageEdited from './MessageEdited.js';
import MessageMetadata from './MessageMetadata.js';

export default class Message extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.flightId = entity.flightId;
    this.sourceUserId = entity.originator
      ? entity.originator.id
      : null;
    this.targetChannelId = entity.recipient
      ? entity.recipient.id
      : null;
    this.isChannel = entity.isGroup;
    this.timestamp = entity.timestamp;
    this.mimeType = entity.mimeType;
    this.body = entity.data.toString().trim() || '';
    this.metadata = entity.metadata
      ? new MessageMetadata(client, entity.metadata)
      : null;
    this.edited = entity.edited
      ? new MessageEdited(client, entity.edited)
      : null;

    this.isCommand = client.commandManager?.isCommand(this) ?? false;
    this.bodyParts = this.body?.split(this.client.SPLIT_REGEX)?.filter(Boolean) ?? [];
  }
}
