import MessageEdited from './MessageEdited.js';
import MessageMetadata from './MessageMetadata.js';

export default class MessageUpdate {
  constructor (client, entity) {
    this.sourceUserId = entity.originator
      ? entity.originator.id
      : null;
    this.targetChannelId = entity.recipient
      ? entity.recipient.id
      : null;
    this.isChannel = entity.isGroup;
    this.timestamp = entity.timestamp;
    this.body = entity.data.toString().trim() || '';
    this.metadata = entity.metadata
      ? new MessageMetadata(client, entity.metadata)
      : null;
    this.edited = entity.edited
      ? new MessageEdited(client, entity.edited)
      : null;

    this.isCommand = client.commandManager?.isCommand(this) ?? false;
  }
}
