import Base from './Base.js';
import TipLeaderboardItem from './TipLeaderboardItem.js';

class TipLeaderboard extends Base {
  constructor (client, data) {
    super(client);
    this.leaderboard = data?.leaderboard.map((leaderboard) => new TipLeaderboardItem(client, leaderboard)) ?? [];
  }

  toJSON () {
    return {
      leaderboard: this.leaderboard.map((item) => item.toJSON())
    };
  }
}

export default TipLeaderboard;
