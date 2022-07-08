const Base = require('./Base');

class MessageEdit extends Base {
  constructor (client, data) {
    super(client);

    this.subscriberId = data.subscriberId;
    this.timestamp = data.timestamp;
  }
  // TODO: Methods
}

module.exports = MessageEdit;
