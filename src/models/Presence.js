const Base = require('./Base');

class Presence extends Base {
  constructor (client, data) {
    super(client);

    this.device = data.device;
    this.state = data.state;
    this.lastActive = data.lastActive;
    this.subscriberId = data.subscriberId;
  }
}

module.exports = Presence;
