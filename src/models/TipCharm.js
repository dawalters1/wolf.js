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
    this.subscriber = new IdHash(this.subscriber);
  }

  async charm () {
    return await this.client.charm.getById(this.charmId);
  }

  toJSON () {
    return {
      id: this.id,
      quantity: this.quantity,
      credits: this.credits,
      magnitude: this.magnitude,
      subscriber: this.subscriber.toJSON()
    };
  }
}

export default TipCharm;
