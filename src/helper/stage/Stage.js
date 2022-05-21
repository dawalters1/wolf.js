const Base = require('../Base');
const Request = require('./Request');

class Stage extends Base {
  // eslint-disable-next-line no-useless-constructor
  constructor (client) {
    super(client);

    this.request = new Request(this.client);
  }
}

module.exports = Stage;
