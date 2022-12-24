import Base from './Base.js';
import { ContextType } from '../constants/index.js';
import MessageEdit from './MessageEdit.js';
import MessageEmbed from './MessageEmbed.js';
import MessageMetadata from './MessageMetadata.js';
import TipContext from './TipContext.js';
import WOLFAPIError from './WOLFAPIError.js';

class Message extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.body = data?.data?.toString().trim();
    this.sourceSubscriberId = data?.originator?.id ?? data?.originator ?? data.subscriberId;
    this.targetGroupId = data?.isGroup ? data.targetGroupId ?? data?.recipient?.id ?? data?.recipient.id : null;
    this.embeds = data?.embeds ? data?.embeds.map((embed) => new MessageEmbed(client, embed)) : null;
    this.metadata = data?.metadata ? new MessageMetadata(client, data?.metadata) : null;
    this.isGroup = data?.isGroup;
    this.timestamp = data?.timestamp;
    this.edited = data?.edited ? new MessageEdit(client, data?.edited) : null;
    this.type = data?.mimeType;
    this.isCommand = client.commandHandler.isCommand(this.body);
  }

  async reply (content, options) {
    return this.client.messaging.sendMessage(this, content, options);
  }

  async delete () {
    if (!this.isGroup) {
      throw new WOLFAPIError('editing private messages is currently not supported');
    }

    return await this.client.messaging.delete(this.targetGroupId, this.timestamp);
  }

  async restore () {
    if (!this.isGroup) {
      throw new WOLFAPIError('editing private messages is currently not supported');
    }

    return await this.client.messaging.restore(this.targetGroupId, this.timestamp);
  }

  async getEditHistory () {
    if (!this.isGroup) {
      throw new WOLFAPIError('editing private messages is currently not supported');
    }

    if (!(this.metadata?.isEdited || this.metadata?.isDeleted)) {
      return [];
    }

    return await this.client.messaging.getGroupMessageEditHistory(this.targetGroupId, this.timestamp);
  }

  async tip (charm) {
    if (!this.isGroup) {
      throw new WOLFAPIError('tipping private messages is currently not supported');
    }

    return await this.client.tipping.tip(
      this.sourceSubscriberId,
      this.targetGroupId,
      new TipContext(this.client,
        {
          type: ContextType.MESSAGE,
          id: this.timestamp
        }
      ),
      charm
    );
  }

  toJSON () {
    return {
      id: this.id,
      body: this.body,
      sourceSubscriberId: this.sourceSubscriberId,
      targetGroupId: this.targetGroupId,
      embeds: this.embeds?.map((embed) => this.embeds.toJSON()),
      metadata: this.metadata?.toJSON(),
      isGroup: this.isGroup,
      timestamp: this.timestamp,
      edited: this.edited?.toJSON(),
      type: this.type,
      isCommand: this.isCommand
    };
  }
}

export default Message;
