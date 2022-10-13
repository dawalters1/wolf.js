import Base from './Base.js';

class MessageEdit extends Base {
  constructor (client, data) {
    super(client);
    this.subscriberId = data?.subscriberId;
    this.timestamp = data?.timestamp;
  }

  toJSON () {
    return {
      subscriberId: this.subscriberId,
      timestamp: this.timestamp
    };
  }
}

export default MessageEdit;
