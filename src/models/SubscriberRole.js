import Base from './Base.js';

class SubscriberRole extends Base {
  constructor (client, data) {
    super(client);

    this.roleId = data?.roleId;
    this.channelIdList = data?.groupIdList;
  }

  async role (language, forceNew = false) {
    return this.client.role.getById(this.roleId, language, forceNew);
  }

  async channels (subscribe = true, forceNew = false) {
    return this.client.channel.getByIds(this.channelIdList, subscribe, forceNew);
  }
}

export default SubscriberRole;
