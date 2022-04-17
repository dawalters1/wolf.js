const Base = require('./Base');
const TipLeaderboardItem = require('./TipLeaderboardItem');

class TipDetail extends Base {
  constructor (api, data) {
    super(api);

    this.leaderboard = data.leaderboard.map((leaderboard) => new TipLeaderboardItem(api, leaderboard));
  }
}

module.exports = TipDetail;
