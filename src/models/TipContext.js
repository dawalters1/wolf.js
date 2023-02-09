import Base from './Base.js';

class TipContext extends Base {
  constructor (client, data) {
    super(client);
    this.type = data?.type;
    this.id = data?.id;
  }
}

export default TipContext;
