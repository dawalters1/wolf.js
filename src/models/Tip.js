import Base from './Base.js';
import TipCharm from './TipCharm.js';
import TipContext from './TipContext.js';

class Tip extends Base {
  constructor (client, data) {
    super(client);
    this.charmList = data?.charmList.map((charm) => new TipCharm(client, charm)) ?? [];
    this.channelId = data?.groupId;
    this.groupId = this.channelId;
    this.isChannel = !!this.channelId;
    this.isGroup = this.isChannel;
    this.sourceSubscriberId = data?.sourceSubscriberId;
    this.subscriberId = data?.subscriberId;
    this.context = new TipContext(client, data?.context);
  }

  /**
   * Get all the charms tipped
   * @returns {Promise<Array<Charm>>}
   */
  async charms () {
    return await this.client.charm.getByIds(this.charmList.map((charm) => charm.charmId));
  }

  /**
   * Get the group the tip happened in
   * @returns {Promise<Channel>}
   */
  async group () {
    return await this.channel();
  }

  /**
   * Get the channel the tip happened in
   * @returns {Promise<Channel>}
   */
  async channel () {
    return await this.client.channel.getById(this.channelId);
  }

  /**
   * Get the subscriber who tipped
   * @returns {Promise<Subscriber>}
   */
  async sourceSubscriber () {
    return await this.client.subscriber.getById(this.sourceSubscriberId);
  }

  /**
   * Get the subscriber that was tipped
   * @returns {Promise<Subscriber>}
   */
  async targetSubscriber () {
    return await this.client.subscriber.getById(this.subscriberId);
  }
}

export default Tip;
