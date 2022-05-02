const Base = require('../Base');

class Store extends Base {
  constructor (client) {
    super(client);

    this._balance = -1;
  }
}

module.exports = Store;
