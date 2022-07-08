const Base = require('./Base');

class TipContext extends Base {
  constructor (client, data) {
    super(client);

    this.type = data.type;
    this.id = data.id;
  }
}

module.exports = TipContext;
