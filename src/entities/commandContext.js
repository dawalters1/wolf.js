import BaseEntity from './baseEntity.js';

class CommandContext extends BaseEntity {
  constructor (client, data) {
    super(client);

    this.isChannel = data?.isChannel;
    this.argument = data?.argument;
    this.language = data?.language;
    this.targetChannelId = data?.targetChannelId ?? undefined;
    this.sourceUserId = data?.sourceUserId ?? undefined;
    this.timestamp = data?.timestamp;
    this.type = data?.type;
    this.route = data?.route;
  }

  async user () {
    return this.client.user.getById(this.sourceUserId);
  }

  async channel () {
    if (!this.isChannel) { throw new Error('Command is not channel'); }

    return this.client.channel.getById(this.targetChannelId);
  }

  async sendReply (content, opts) {
    if (this.isChannel) {
      return this.client.messaging.sendChannelMessage(this.targetChannelId, content, opts);
    }

    return this.client.messaging.sendPrivateMessage(this.sourceUserId, content, opts);
  }

  async sendPrivateReply (content, opts) {
    return this.client.messaging.sendPrivateMessage(this.sourceUserId, content, opts);
  }
}

export default CommandContext;
