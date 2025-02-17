import Base from '../Base.js';

class User extends Base {
  constructor (client) {
    super(client);

    this.cache = new NotificationCache();
  }
}

export default User;
