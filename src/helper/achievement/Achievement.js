const Base = require('../Base');
const Group = require('./Group');
const Subscriber = require('./Subscriber');

class Achievement extends Base {
  // eslint-disable-next-line no-useless-constructor
  constructor (client) {
    super(client);

    this.group = new Group(client);
    this.subscriber = new Subscriber(client);
    // this._achievements = [];
  }
}

module.exports = Achievement;
