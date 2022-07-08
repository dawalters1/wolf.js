const Base = require('./Base');
const IdHash = require('./IdHash');

class TipCharm extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.quanitity = data.quanitity;
    this.credits = data.credits;
    this.magnitude = data.magnitude;
    this.subscriber = new IdHash(this.subscriber);
  }
}

module.exports = TipCharm;
