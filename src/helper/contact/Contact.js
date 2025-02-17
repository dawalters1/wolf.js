import Base from '../Base.js';
import Blocked from './Blocked.js';

class Contact extends Base {
  constructor (client) {
    super(client);

    this.cache = ContactCache();
    this.blocked = new Blocked(client);
  }

  async list () {

  }

  async add () {

  }

  async delete () {

  }
}

export default Contact;
