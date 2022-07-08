const Base = require('../Base');
const Request = require('./Request');
const Slot = require('./Slot');

class Stage extends Base {
  // eslint-disable-next-line no-useless-constructor
  constructor (client) {
    super(client);

    this.request = new Request(this.client);
    this.slot = new Slot(this.client);
  }
}

module.exports = Stage;
