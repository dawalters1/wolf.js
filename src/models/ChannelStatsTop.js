import Base from './Base.js';

class ChannelStatsTop extends Base {
  constructor (client, data) {
    super(client);
    this.nickname = data?.nickname;
    this.randomQuote = data?.randomQuote;
    this.subId = data?.subId;
    this.wpl = data?.wpl;
    this.value = data?.value;
    this.percentage = data?.percentage;
  }

  /**
   * Get the subscribers profile
   * @returns {Promise<Subscriber>}
   */
  async subscriber () {
    return await this.client.subscriber.getById(this.subId);
  }
}

export default ChannelStatsTop;
