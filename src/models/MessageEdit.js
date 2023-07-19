import Base from './Base.js';

class MessageEdit extends Base {
  constructor (client, data) {
    super(client);
    this.subscriberId = data?.subscriberId;
    this.timestamp = data?.timestamp;
  }

  /**
   * Get the subscriber profile
   * @returns {Promise<Subscriber>}
   */
  async subscriber () {
    return await this.client.subscriber.getById(this.subscriberId);
  }
}

export default MessageEdit;
