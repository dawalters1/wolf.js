const Base = require('./Base');
const TipLeaderboardItem = require('./TipLeaderboardItem');

class TipLeaderboard extends Base {
  constructor (client, data) {
    super(client);

    this.leaderboard = data.leaderboard.map((leaderboard) => new TipLeaderboardItem(client, leaderboard));
  }
}

module.exports = TipLeaderboard;
