const Base = require('../Base');

class Event extends Base {
  constructor (client) {
    super(client);

    this._events = [];
    this._subscriptions = [];
  }
}

module.exports = Event;
