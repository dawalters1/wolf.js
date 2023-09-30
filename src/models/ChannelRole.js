import Base from './Base.js';

class ChannelRole extends Base {
  constructor (client, data, channelId) {
    super(client);
    this.channelId = channelId;

    this.roleId = data?.roleId;
    this.subscriberIdList = data?.subscriberIdList;
    this.maxSeats = data?.maxSeats;
  }

  async subscribers () {
    return this.client.subscriber.getByIds(this.subscriberIdList);
  }

  async assign (subscriberId) {
    return await this.client.channel.role.assign(this.channelId, subscriberId, this.roleId);
  }

  async reassign (oldSubscriberId, newSubscriberId) {
    return await this.client.channel.role.reassign(this.channelId, oldSubscriberId, newSubscriberId, this.roleId);
  }

  async unassign (subscriberId) {
    return await this.client.channel.role.unassign(this.channelId, subscriberId, this.roleId);
  }

  async role (languageId) {
    return await this.client.channel.role.getById(this.roleId, languageId);
  }
}

export default ChannelRole;
