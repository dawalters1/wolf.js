import Base from '../Base.js';

class WOLFStar extends Base {
  constructor (client) {
    super(client);

    this.cache = new WOLFStarCache();
  }

  async getById () {

  }

  async getByIds () {

  }
}

export default WOLFStar;
