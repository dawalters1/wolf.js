import Base from './Base.js';

class ChannelRoleContainer extends Base {
  constructor (client, channelId) {
    super(client);
    this.channelId = channelId;

    this._requestedRoles = false;
    this._requestedMembers = false;

    this._roles = [];
    this._members = [];
  }

  async roles (forceNew = false) {
    return this.client.channel.role.roles(this.channelId, forceNew);
  }

  async members (subscribe = true, forceNew = false) {
    return await this.client.channel.role.members(this.channelId, subscribe, forceNew);
  }

  async assign (subscriberId, roleId) {
    return await this.client.channel.role.assign(this.channelId, subscriberId, roleId);
  }

  async reassign (oldSubscriberId, newSubscriberId, roleId) {
    return await this.client.channel.role.reassign(this.channelId, oldSubscriberId, newSubscriberId, roleId);
  }

  async unassign (subscriberId, roleId) {
    return await this.client.channel.role.assign(this.channelId, subscriberId, roleId);
  }
}

export default ChannelRoleContainer;
