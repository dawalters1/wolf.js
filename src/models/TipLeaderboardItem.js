const Base = require('./Base');
const IdHash = require('./IdHash');

class TipLeaderboardItem extends Base {
  constructor (client, data) {
    super(client);

    this.rank = data.rank;
    this.charmId = data.charmId;
    this.quantity = data.quantity;
    this.credits = data.credits;
    this.group = new IdHash(data.group);
    this.subscriber = new IdHash(data.subscriber);
  }
}

module.exports = TipLeaderboardItem;
