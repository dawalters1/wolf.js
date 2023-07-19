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

  /**
   * Get the profile of the group the action was performed in
   * @returns {Promise<Channel>}
   */
  async group () {
    return await this.channel();
  }

  /**
   * Get the profile of the channel the action was performed in
   * @returns {Promise<Channel>}
   */
  async channel () {
    return await this.client.channel.getById(this.channelId);
  }

  /**
   * Get the profile of the user who performed the action
   * @returns {Promise<Subscriber>}
   */
  async sourceSubscriber () {
    return await this.client.subscriber.getById(this.sourceId);
  }

  /**
   * Get the profile of the user who the action was performed on
   * @returns {Promise<Subscriber>}
   */
  async targetSubscriber () {
    return await this.client.subscriber.getById(this.targetId);
  }
}

export default ChannelSubscriberUpdate;
