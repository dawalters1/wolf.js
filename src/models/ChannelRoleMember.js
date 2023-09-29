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
    return await this.client.channel.role.reassign(this.channelId, this.subscriberId, newSubscriberId, this.roleId);
  }

  async unassign () {
    return await this.client.channel.role.unassign(this.channelId, this.subscriberId, this.roleId);
  }
}

export default ChannelRoleMember;
