import Base from './Base.js';

class WOLFStar extends Base {
  constructor (client, data) {
    super(client);

    this.userId = data?.subscriberId;
    this.talentList = data?.talentList;
    this.shows = data?.shows;
    this.maxListeners = data?.maxListeners;
    this.totalListeners = data?.totalListeners;
    this.weeklyLeaderboardPosition = data?.weeklyLeaderboardPosition;
    this.monthlyLeaderboardPositions = data?.monthlyLeaderboardPositions;
  }
}

export default WOLFStar;
