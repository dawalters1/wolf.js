import WOLFAPIError from './WOLFAPIError.js';

class CommandContext {
  /**
   *
   * @param {import('../client/WOLF').default} client
   * @param {*} data
   */
  constructor (client, data) {
    this.client = client;
    this.isGroup = data?.isGroup;
    this.argument = data?.argument;
    this.language = data?.language;
    this.targetGroupId = data?.targetGroupId ?? undefined;
    this.sourceSubscriberId = data?.sourceSubscriberId ?? undefined;
    this.timestamp = data?.timestamp;
    this.type = data?.type;
  }

  async subscriber () {
    return await this.client.subscriber.getById(this.sourceSubscriberId);
  }

  async group () {
    if (!this.isGroup) {
      throw new WOLFAPIError('cannot request group for non-group command', { ...this.toJSON() });
    }

    return await this.client.group.getById(this.targetGroupId);
  }

  async reply (content, options) {
    if (this.isGroup) {
      return await this.client.messaging.sendGroupMessage(this.targetGroupId, content, options);
    }

    return await this.client.messaging.sendPrivateMessage(this.sourceSubscriberId, content, options);
  }

  async replyPrivate (content, options) {
    return await this.client.messaging.sendPrivateMessage(this.sourceSubscriberId, content, options);
  }

  async hasCapability (capability, checkStaff = true, checkAuthorized = true) {
    if (!this.isGroup) {
      throw new WOLFAPIError('hasCapability can only be used on a group message', { ...this.toJSON() });
    }

    return await this.client.utility.group.member.hasCapability(this.targetGroupId, this.sourceSubscriberId, capability, checkStaff, checkAuthorized);
  }

  toJSON () {
    return {
      isGroup: this.isGroup,
      argument: this.argument,
      language: this.language,
      targetGroupId: this.targetGroupId,
      sourceSubscriberId: this.sourceSubscriberId,
      timestamp: this.timestamp,
      type: this.type
    };
  }
}

export default CommandContext;
