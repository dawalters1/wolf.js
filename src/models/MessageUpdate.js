import Base from './Base.js';
import MessageMetadata from './MessageMetadata.js';

class MessageUpdate extends Base {
  constructor (client, data) {
    super(client);

    this.data = data?.data?.toString().trim();
    this.metadata = data.metadata ? new MessageMetadata(client, this.metadata) : null;
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

export default MessageUpdate;
