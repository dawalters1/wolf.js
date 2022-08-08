import { Base } from './Base.js';
import { IdHash } from './IdHash.js';

class TipCharm extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.quantity = data?.quantity;
    this.credits = data?.credits;
    this.magnitude = data?.magnitude;
    this.subscriber = new IdHash(this.subscriber);
  }
}

export { TipCharm };
