const Base = require('./Base');
const TipCharm = require('./TipCharm');

class TipDetail extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.list = data.list.map((charm) => new TipCharm(client, charm));
    this.version = data.version;
  }
}

module.exports = TipDetail;
