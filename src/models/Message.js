import Base from './Base.js';
import { ContextType } from '../constants/index.js';
import MessageEdit from './MessageEdit.js';
import MessageEmbed from './MessageEmbed.js';
import MessageMetadata from './MessageMetadata.js';
import WOLFAPIError from './WOLFAPIError.js';

class Message extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.body = data?.data?.toString().trim();
    this.sourceSubscriberId = data?.originator?.id ?? data?.originator ?? data.subscriberId;
    this.targetChannelId = data?.isChannel ? data.targetGroupId ?? data?.recipient?.id ?? data?.recipient.id : null;
    this.targetGroupId = this.targetChannelId;
    this.embeds = data?.embeds ? data?.embeds.map((embed) => new MessageEmbed(client, embed)) : null;
    this.metadata = data?.metadata ? new MessageMetadata(client, data?.metadata) : null;
    this.isChannel = data?.isGroup;
    this.isGroup = this.isChannel;
    this.timestamp = data?.timestamp;
    this.edited = data?.edited ? new MessageEdit(client, data?.edited) : null;
    this.type = data?.mimeType;
    this.isCommand = client.commandHandler.isCommand(this.body);
  }

  async reply (content, options) {
    return this.client.messaging.sendMessage(this, content, options);
  }

  async replyPrivate (content, options) {
    return this.client.messaging.sendPrivateMessage(this.sourceSubscriberId, content, options);
  }

  async delete () {
    if (!this.isChannel) {
      throw new WOLFAPIError('editing private messages is currently not supported');
    }

    return await this.client.messaging.delete(this.targetChannelId, this.timestamp);
  }

  async restore () {
    if (!this.isChannel) {
      throw new WOLFAPIError('editing private messages is currently not supported');
    }

    return await this.client.messaging.restore(this.targetChannelId, this.timestamp);
  }

  async getEditHistory () {
    if (!this.isChannel) {
      throw new WOLFAPIError('editing private messages is currently not supported');
    }

    if (!(this.metadata?.isEdited || this.metadata?.isDeleted)) {
      return [];
    }

    return await this.client.messaging.getGroupMessageEditHistory(this.targetChannelId, this.timestamp);
  }

  async subscriber () {
    return await this.client.subscriber.getById(this.sourceSubscriberId);
  }

  async group () {
    return this.channel();
  }

  async channel () {
    if (!this.isChannel) {
      throw new WOLFAPIError('cannot request channel for non-channel command', { ...this.toJSON() });
    }

    return await this.client.channel.getById(this.targetChannelId);
  }

  async tip (charm) {
    if (!this.isChannel) {
      throw new WOLFAPIError('tipping private messages is currently not supported');
    }

    return await this.client.tipping.tip(
      this.sourceSubscriberId,
      this.targetChannelId,
      {
        type: ContextType.MESSAGE,
        id: this.timestamp
      },
      charm
    );
  }
}

export default Message;
