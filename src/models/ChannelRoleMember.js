import Base from './Base.js';

class ChannelRoleMember extends Base {
  constructor (client, data, channelId) {
    super(client);

    this.channelId = channelId;
    this.roleId = data?.roleId;
    this.subscriberId = data?.subscriberId;
  }

  async subscriber () {
    return this.client.subscriber.getById(this.subscriberId);
  }

  async resassign (newSubscriberId) {
    return await this.client.role.channel.reassign(this.channelId, this.subscriberId, newSubscriberId, this.roleId);
  }

  async unassign () {
    return await this.client.role.channel.unassign(this.channelId, this.subscriberId, this.roleId);
  }

  async role (languageId) {
    return await this.client.role.getById(this.roleId, languageId);
  }
}

export default ChannelRoleMember;
