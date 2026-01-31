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

  async user () {
    return this.client.user.fetch(this.sourceUserId);
  }

  async channel () {
    if (!this.isChannel) { throw new Error(); }

    return this.client.channel.fetch(this.targetChannelId);
  }

  async tip (tipCharms) {
    if (!this.isChannel) { throw new Error(''); }

    return this.client.tip.tip(
      this.targetChannelId,
      this.sourceUserId,
      {
        type: ContextType.MESSAGE,
        timestamp: this.timestamp
      },
      tipCharms
    );
  }

  async sendReply (content, opts) {
    if (this.isChannel) {
      return this.client.messaging.sendChannelMessage(this.targetChannelId, content, opts);
    }
    return this.client.messaging.sendPrivateMessage(this.sourceUserId, content, opts);
  }

  async delete () {
    if (!this.isChannel) { throw new Error(); }

    return this.client.messaging.delete(this.targetChannelId, this.timestamp);
  }

  async restore () {
    if (!this.isChannel) { throw new Error(); }

    return this.client.messaging.restore(this.targetChannelId, this.timestamp);
  }
}
