import Base from '../Base.js';

class Channel extends Base {
  constructor (client) {
    super(client);

    this.cache = new EventChannelCache();
  }

  async list () {

  }

  async create () {

  }

  async update () {

  }

  async delete () {

  }
}

export default Channel;
