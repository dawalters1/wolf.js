const Base = require('../Base');

class Subscription extends Base {
  constructor (client) {
    super(client);

    this._groups = [];
  }
}

module.exports = Subscription;
