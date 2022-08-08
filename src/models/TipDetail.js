import { Base } from './Base.js';
import { TipCharm } from './TipCharm.js';

class TipDetail extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.list = data?.list.map((charm) => new TipCharm(client, charm));
    this.version = data?.version;
  }
}

export { TipDetail };
