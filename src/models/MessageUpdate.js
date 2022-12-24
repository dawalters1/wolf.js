import Base from './Base.js';
import MessageMetadata from './MessageMetadata.js';

class MessageUpdate extends Base {
  constructor (client, data) {
    super(client);

    this.data = data?.data?.toString().trim();
    this.metadata = data.metadata ? new MessageMetadata(client, this.metadata) : undefined;
    this.subscriberId = data?.subscriberId;
    this.timestamp = data?.timestamp;
  }

  toJSON () {
    return {
      data: this.data,
      metadata: this.metadata.toJSON(),
      subscriberId: this.subscriberId,
      timestamp: this.timestamp
    };
  }
}

export default MessageUpdate;
