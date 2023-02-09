import Base from './Base.js';

class MessageResponse extends Base {
  constructor (client, data) {
    super(client);
    this.uuid = data?.uuid;
    this.timestamp = data?.timestamp;
    this.slowModeRateInSeconds = data?.slowModeRateInSeconds;
  }
}

export default MessageResponse;
