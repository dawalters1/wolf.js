import UserPresenceCache from '../../cache/UserPresenceCache.js';
import Base from '../Base.js';

class Presence extends Base {
  constructor (client) {
    super(client);

    this.userPresenceCache = new UserPresenceCache();
  }

  async getById () {

  }

  async getByIds () {

  }
}

export default Presence;
