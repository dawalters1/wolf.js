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
    this.targetChannelId = data?.isGroup ? data.targetGroupId ?? data?.recipient?.id ?? data?.recipient.id : null;
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

  /**
   * Reply to the message
   * @param {String | Buffer} content
   * @param {MessageSendOptions} options
   * @returns {Promise<Response<MessageResponse>>}
   */
  async reply (content, options) {
    return this.client.messaging.sendMessage(this, content, options);
  }

  /**
   * Send the subscriber who sent the message a private message
   * @param {String | Buffer} content
   * @param {MessageSendOptions} options
   * @returns {Promise<Response<MessageResponse>>}
   */
  async replyPrivate (content, options) {
    return this.client.messaging.sendPrivateMessage(this.sourceSubscriberId, content, options);
  }

  /**
   * Delete the current message
   * @returns {Promise<Response>}
   */
  async delete () {
    if (!this.isChannel) {
      throw new WOLFAPIError('editing private messages is currently not supported');
    }

    return await this.client.messaging.delete(this.targetChannelId, this.timestamp);
  }

  /**
   * Restore the current message
   * @returns {Promise<Response>}
   */
  async restore () {
    if (!this.isChannel) {
      throw new WOLFAPIError('editing private messages is currently not supported');
    }

    return await this.client.messaging.restore(this.targetChannelId, this.timestamp);
  }

  /**
   * Get the edit history for the message
   * @returns {Promise<Array<MessageUpdate>>}
   */
  async getEditHistory () {
    if (!this.isChannel) {
      throw new WOLFAPIError('editing private messages is currently not supported');
    }

    if (!(this.metadata?.isEdited || this.metadata?.isDeleted)) {
      return [];
    }

    return await this.client.messaging.getGroupMessageEditHistory(this.targetChannelId, this.timestamp);
  }

  /**
   * Get the subscriber profile
   * @returns {Promise<Subscriber>}
   */
  async subscriber () {
    return await this.client.subscriber.getById(this.sourceSubscriberId);
  }

  /**
   * Get the group profile
   * @returns {Promise<Channel>}
   */
  async group () {
    return this.channel();
  }

  /**
   * Get the channel profile
   * @returns {Promise<Channel>}
   */
  async channel () {
    if (!this.isChannel) {
      throw new WOLFAPIError('cannot request channel for non-channel command', { ...this.toJSON() });
    }

    return await this.client.channel.getById(this.targetChannelId);
  }

  /**
   * Tip the message
   * @param {{ id: number, quantity: number } | Array<{ id: number, quantity: number }>} charm
   * @returns {Promise<Response>}
   */
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
