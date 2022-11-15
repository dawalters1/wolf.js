import Base from './Base.js';
import TipCharm from './TipCharm.js';

class TipDetail extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.list = data?.list.map((charm) => new TipCharm(client, charm)) ?? [];
    this.version = data?.version;
  }

  toJSON () {
    return {
      id: this.id,
      list: this.list.map((item) => item.toJSON()),
      version: this.version
    };
  }
}

export default TipDetail;