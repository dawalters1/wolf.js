const Base = require('./Base');
const TipCharm = require('./TipCharm');

class TipSummary extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.charmList = data.charmList.map((charm) => new TipCharm(client, charm));
    this.version = data.version;
  }
}

module.exports = TipSummary;
