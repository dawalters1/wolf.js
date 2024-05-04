import Base from './Base.js';

class Presence extends Base {
  constructor (client, data) {
    super(client);
    this.deviceType = data?.deviceType;
    this.onlineState = data?.onlineState;
    this.lastActive = data?.lastActive;
    this.subscriberId = data?.subscriberId;
  }

  /**
   * Get the subscriber profile
   * @returns {Promise<Subscriber>}
   */
  async subscriber () {
    return await this.client.subscriber.getById(this.subscriberId);
  }
}

export default Presence;
