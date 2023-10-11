import Base from './Base.js';
import IdHash from './IdHash.js';

class TipLeaderboardItem extends Base {
  constructor (client, data) {
    super(client);
    this.rank = data?.rank;
    this.charmId = data?.charmId;
    this.quantity = data?.quantity;
    this.credits = data?.credits;
    this.channel = data?.group ? new IdHash(this.client, data.group, false) : null;
    this.group = this.channel;
    this.subscriber = data?.subscriber ? new IdHash(this.client, data.subscriber) : null;
  }

  /**
   * Get the charm
   * @returns {Promise<Charm>}
   */
  async charm () {
    return await this.client.charm.getById(this.charmId);
  }
}

export default TipLeaderboardItem;
