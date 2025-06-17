import BaseEntity from './baseEntity';
import TipLeaderboardItem, { ServerTipLeaderboardItem } from './tipLeaderboardItem';
import WOLF from '../client/WOLF';

export type ServerTipLeaderboard = {
    leaderboard: ServerTipLeaderboardItem[]
}

export class TipLeaderboard extends BaseEntity {
  leaderboard: Set<TipLeaderboardItem> = new Set();

  constructor (client: WOLF, data: ServerTipLeaderboard) {
    super(client);

    data.leaderboard?.map((leaderboardItem) => this.leaderboard.add(new TipLeaderboardItem(this.client, leaderboardItem)));
  }
}

export default TipLeaderboard;
