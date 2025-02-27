import Base from './Base.js';

class MessageEdited extends Base {
  constructor (client, data) {
    super(client);

    this.userId = data?.subscriberId;
    this.timestamp = data?.timestamp;
  }
}

export default MessageEdited;
