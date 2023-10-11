import Base from './Base.js';
import IdHash from './IdHash.js';

class TipCharm extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.charmId = data?.charmId;
    this.quantity = data?.quantity;
    this.credits = data?.credits;
    this.magnitude = data?.magnitude;
    this.subscriber = new IdHash(this.client, this.subscriber);
  }

  /**
   * Get the charm
   * @returns {Promise<Charm>}
   */
  async charm () {
    return await this.client.charm.getById(this.charmId);
  }
}

export default TipCharm;
