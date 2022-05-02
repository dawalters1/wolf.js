const Base = require('../Base');

class Notification extends Base {
  constructor (client) {
    super(client);

    this._notifications = [];
  }
}

module.exports = Notification;
