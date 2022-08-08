import { Base } from './Base.js';
import { IdHash } from './IdHash.js';

class TipLeaderboardItem extends Base {
  constructor (client, data) {
    super(client);
    this.rank = data?.rank;
    this.charmId = data?.charmId;
    this.quantity = data?.quantity;
    this.credits = data?.credits;
    this.group = new IdHash(data?.group);
    this.subscriber = new IdHash(data?.subscriber);
  }
}

export { TipLeaderboardItem };
