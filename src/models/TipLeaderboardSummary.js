import Base from './Base.js';
import IdHash from './IdHash.js';

class TipLeaderboardSummary extends Base {
  constructor (client, data) {
    super(client);
    this.topGifters = (data?.topGifters || []).map((subscriber) => new IdHash(client, subscriber));
    this.topGroups = (data?.topGroups || []).map((group) => new IdHash(client, group));
    this.topSpenders = (data?.topSpenders || []).map((subscriber) => new IdHash(client, subscriber));
  }

  toJSON () {
    return {
      topGifters: this.topGifters.map((item) => item.toJSON()),
      topGroups: this.topGroups.map((item) => item.toJSON()),
      topSpenders: this.topSpenders.map((item) => item.toJSON())
    };
  }
}

export default TipLeaderboardSummary;
