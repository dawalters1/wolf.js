import BaseEntity from './BaseEntity.js';
import TipLeaderboardItem from './TipLeaderboardItem.js';

export default class TipLeaderboard extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.leaderboard = new Set(entity.leaderboard?.map((leaderboard) => new TipLeaderboardItem(this.client, leaderboard)));
    this.current = this.current
      ? new TipLeaderboardItem(this.client, this.current)
      : null;
  }
}
