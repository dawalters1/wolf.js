const Base = require('./Base');
const IdHash = require('./IdHash');

class TipLeaderboardSummary extends Base {
  constructor (api, data) {
    super(api);

    this.topGifters = data.topGifters.map((idHash) => new IdHash(api, idHash));
    this.topGroups = data.topGifters.map((idHash) => new IdHash(api, idHash));
    this.topSpenders = data.topSpenders.map((idHash) => new IdHash(api, idHash));
  }
}

module.exports = TipLeaderboardSummary;
