const Base = require('./Base');
const IdHash = require('./IdHash');

class TipLeaderboardSummary extends Base {
  constructor (client, data) {
    super(client);

    this.topGifters = (data.topGifters || []).map((subscriber) => new IdHash(client, subscriber));
    this.topGroups = (data.topGroups || []).map((group) => new IdHash(client, group));
    this.topSpenders = (data.topSpenders || []).map((subscriber) => new IdHash(client, subscriber));
  }
}

module.exports = TipLeaderboardSummary;
