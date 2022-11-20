import Base from './Base.js';

class MessageResponse extends Base {
  constructor (client, data) {
    super(client);
    this.uuid = data?.uuid;
    this.timestamp = data?.timestamp;
    this.slowModeRateInSeconds = data?.slowModeRateInSeconds;
  }

  toJSON () {
    return {
      uuid: this.uuid,
      timestamp: this.timestamp,
      slowModeRateInSeconds: this.slowModeRateInSeconds
    };
  }
}

export default MessageResponse;
