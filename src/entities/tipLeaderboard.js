import BaseEntity from './baseEntity.js';
import TipLeaderboardItem from './tipLeaderboardItem.js';

export class TipLeaderboard extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.leaderboard = new Set();
    entity.leaderboard?.forEach(item => this.leaderboard.add(new TipLeaderboardItem(this.client, item)));
  }
}

export default TipLeaderboard;
