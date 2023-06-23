import Base from './Base.js';

class ChannelSubscriberUpdate extends Base {
  constructor (client, data) {
    super(client);

    this.channelId = data?.groupId;
    this.groupId = this.channelId;
    this.sourceId = data?.sourceId;
    this.targetId = data?.targetId;
    this.action = data?.action;
  }

  async group () {
    return await this.channel();
  }

  async channel () {
    return await this.client.channel.getById(this.channelId);
  }

  async sourceSubscriber () {
    return await this.client.subscriber.getById(this.sourceId);
  }

  async targetSubscriber () {
    return await this.client.subscriber.getById(this.targetId);
  }
}

export default ChannelSubscriberUpdate;
