import Base from './Base.js';
import IdHash from './IdHash.js';

class TipLeaderboardSummary extends Base {
  constructor (client, data) {
    super(client);

    this.topGifters = (data?.topGifters || []).map((subscriber) => new IdHash(this.client, subscriber));
    this.topChannels = (data?.topGroups || []).map((group) => new IdHash(this.client, group, false));
    this.topGroups = this.topChannels;
    this.topSpenders = (data?.topSpenders || []).map((subscriber) => new IdHash(this.client, subscriber));
  }
}

export default TipLeaderboardSummary;
