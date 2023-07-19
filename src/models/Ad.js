import Base from './Base.js';

class Ad extends Base {
  constructor (client, data) {
    super(client);

    this.start = data.start;
    this.end = data.end;

    this.ad = data.ad;
  }

  /**
   * Get the group profile
   * @returns {Promise<Channel>}
   */
  async group () {
    return await this.channel();
  }

  /**
   * Get the channel profile
   * @returns {Promise<Channel>}
   */
  async channel () {
    return await this.client.channel.getByName(this.ad);
  }
}
export default Ad;
