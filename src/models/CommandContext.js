import WOLFAPIError from './WOLFAPIError.js';

class CommandContext {
  /**
   *
   * @param {import('../client/WOLF').default} client
   * @param {*} data
   */
  constructor (client, data) {
    this.client = client;

    this.isChannel = data?.isGroup;
    this.isGroup = this.isChannel;
    this.argument = data?.argument;
    this.language = data?.language;
    this.targetChannelId = data?.targetGroupId ?? undefined;
    this.targetGroupId = this.targetChannelId;
    this.sourceSubscriberId = data?.sourceSubscriberId ?? undefined;
    this.timestamp = data?.timestamp;
    this.type = data?.type;
    this.route = data?.route;
  }

  async subscriber () {
    return await this.client.subscriber.getById(this.sourceSubscriberId);
  }

  async group () {
    return await this.channel();
  }

  async channel () {
    if (!this.isChannel) {
      throw new WOLFAPIError('cannot request channel for non-channel command', { ...this.toJSON() });
    }

    return await this.client.channel.getById(this.targetChannelId);
  }

  async reply (content, options) {
    if (this.isChannel) {
      return await this.client.messaging.sendChannelMessage(this.targetChannelId, content, options);
    }

    return await this.client.messaging.sendPrivateMessage(this.sourceSubscriberId, content, options);
  }

  async replyPrivate (content, options) {
    return await this.client.messaging.sendPrivateMessage(this.sourceSubscriberId, content, options);
  }

  async hasCapability (capability, checkStaff = true, checkAuthorized = true) {
    if (!this.isChannel) {
      throw new WOLFAPIError('hasCapability can only be used on a channel message', { ...this.toJSON() });
    }

    return await this.client.utility.channel.member.hasCapability(this.targetChannelId, this.sourceSubscriberId, capability, checkStaff, checkAuthorized);
  }

  async hasPrivilege (privilege, requireAll = false) {
    return await this.client.utility.subscriber.privilege.has(this.sourceSubscriberId, privilege, requireAll);
  }

  async isAuthorized () {
    return await this.client.authorization.isAuthorized(this.sourceSubscriberId);
  }

  getPhrase (language, name = undefined) {
    if (!name) { // In this case language is the phrase name
      return this.client.phrase.getByLanguageAndName(this.language, language);
    }

    return this.client.phrase.getByLanguageAndName(language, name);
  }

  toJSON () {
    return {
      isGroup: this.isGroup,
      isChannel: this.isChannel,
      argument: this.argument,
      language: this.language,
      targetChannelId: this.targetChannelId,
      targetGroupId: this.targetGroupId,
      sourceSubscriberId: this.sourceSubscriberId,
      timestamp: this.timestamp,
      type: this.type,
      route: this.route
    };
  }
}

export default CommandContext;
