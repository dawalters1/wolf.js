import Base from '../Base.js';

class Global extends Base {
  constructor (client) {
    super(client);

    this.cache = new NotificationCache();
  }
}

export default Global;
