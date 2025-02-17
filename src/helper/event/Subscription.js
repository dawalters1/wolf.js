import Base from '../Base.js';

class Subscription extends Base {
  constructor (client) {
    super(client);

    this.cache = new EventSubscriptionCache();
  }

  async list () {

  }

  async subscribe () {

  }

  async unsubscribe () {

  }
}

export default Subscription;
