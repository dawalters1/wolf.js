import Base from './Base.js';
import IdHash from './IdHash.js';

class TipLeaderboardItem extends Base {
  constructor (client, data) {
    super(client);
    this.rank = data?.rank;
    this.charmId = data?.charmId;
    this.quantity = data?.quantity;
    this.credits = data?.credits;
    this.group = data?.group ? new IdHash(data.group) : null;
    this.subscriber = data?.subscriber ? new IdHash(data.subscriber) : null;
  }

  toJSON () {
    return {
      rank: this.rank,
      charmId: this.charmId,
      quantity: this.quantity,
      credits: this.credits,
      group: this.group?.toJSON(),
      subscriber: this.subscriber?.toJSON()
    };
  }
}

export default TipLeaderboardItem;
