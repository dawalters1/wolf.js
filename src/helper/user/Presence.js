import Base from '../Base.js';

class Presence extends Base {
  constructor (client) {
    super(client);

    this.cache = new PresenceCache();
  }

  async getById () {

  }

  async getByIds () {

  }
}

export default Presence;
