import Base from './Base.js';
import { ContextType } from '../constants/index.js';
import MessageEdit from './MessageEdit.js';
import MessageEmbed from './MessageEmbed.js';
import MessageMetadata from './MessageMetadata.js';
import TipContext from './TipContext.js';

class Message extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.body = data?.data?.toString().trim();
    this.sourceSubscriberId = data?.originator?.id ?? data?.originator;
    this.targetGroupId = data?.isGroup ? data?.recipient?.id ?? data?.recipient.id : null;
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
    return await this.client.messaging.delete(this.targetGroupId, this.timestamp);
  }

  async restore () {
    return await this.client.messaging.restore(this.targetGroupId, this.timestamp);
  }

  async tip (charm) {
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
