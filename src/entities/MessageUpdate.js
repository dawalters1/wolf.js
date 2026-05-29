import BaseEntity from './BaseEntity.js';
import MessageEdited from './MessageEdited.js';
import MessageMetadata from './MessageMetadata.js';

export default class MessageUpdate extends BaseEntity {
  constructor (client, entity) {
    super(client);

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

  async user () {
    return this.client.user.fetch(this.sourceUserId);
  }

  async channel () {
    if (!this.isChannel) { throw new Error(); }

    return this.client.channel.fetch(this.targetChannelId);
  }
}
