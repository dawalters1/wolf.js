import Base from '../Base.js';
import Global from './Global.js';
import User from './User.js';

class Notification extends Base {
  constructor (client) {
    super(client);

    this.user = new User(client);
    this.global = new Global(client);
  }
}

export default Notification;
