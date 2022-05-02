const Base = require('../Base');
const Subscription = require('./Subscription');

class Messaging extends Base {
  constructor (client) {
    super(client);

    this.subscription = new Subscription(client);
  }
}

module.exports = Messaging;
