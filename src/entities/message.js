import BaseEntity from './baseEntity.js';
import ContextType from '../constants/ContextType.js';
import MessageEdited from './messageEdited.js';
import MessageMetadata from './messageMetadata.js';

export class Message extends BaseEntity {
  /**
   *
   * @param {import('../client/WOLF.js').default} client
   * @param {*} entity
   */
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

  async getUser () {
    return this.client.user.getById(this.sourceUserId);
  }

  async getChannel () {
    if (!this.isChannel) { throw new Error(); }

    return this.client.channel.getById(this.targetChannelId);
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

    return this.client.messaging.deleteMessage(this.targetChannelId, this.timestamp);
  }

  async restore () {
    if (!this.isChannel) { throw new Error(); }

    return this.client.messaging.restoreMessage(this.targetChannelId, this.timestamp);
  }
}

export default Message;
