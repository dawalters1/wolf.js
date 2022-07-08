const Base = require('./Base');

class MessageResponse extends Base {
  constructor (client, data) {
    super(client);

    this.uuid = data.uuid;
    this.timestamp = data.timestamp;
  }
}

module.exports = MessageResponse;
