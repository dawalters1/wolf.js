import BaseEntity from './BaseEntity.js';

export default class CommandContext extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.isChannel = entity?.isChannel;
    this.body = entity?.body;
    this.language = entity?.language;
    this.targetChannelId = entity?.targetChannelId ?? undefined;
    this.sourceUserId = entity?.sourceUserId ?? undefined;
    this.timestamp = entity?.timestamp;
    this.type = entity?.type;
    this.route = entity?.route;
    this.message = entity.message;

    this.bodyParts = this.body?.split(this.client.SPLIT_REGEX)?.filter(Boolean) ?? [];
  }

  async user () {
    return this.client.user.fetch(this.sourceUserId);
  }

  async channel () {
    if (!this.isChannel) { throw new Error('Command is not a Channel command'); }

    return this.client.channel.fetch(this.targetChannelId);
  }

  getPhrase (language, name = undefined) {
    if (!name) { // In this case language is the phrase name
      return this.client.phrase.getByLanguageAndName(this.language, language);
    }

    return this.client.phrase.getByLanguageAndName(language, name);
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

  async hasPrivilege (privilege, requireAll = true) {
    return await this.client.utility.user.privilege.has(this.sourceUserId, privilege, requireAll);
  }

  async delete () {
    if (!this.isChannel) { throw new Error('Private Messages cannot be deleted'); }

    return this.client.messaging.edit(this.targetChannelId, this.timestamp, true, this.isChannel);
  }

  async restore () {
    if (!this.isChannel) { throw new Error('Private Messages cannot be deleted'); }

    return this.client.messaging.restore(this.targetChannelId, this.timestamp, false, this.isChannel);
  }
}
