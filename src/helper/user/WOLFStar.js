import WOLFStarCache from '../../cache/WOLFStarCache.js';
import Base from '../Base.js';

class WOLFStar extends Base {
  constructor (client) {
    super(client);

    this.wolfStarCache = new WOLFStarCache();
  }

  async getById () {

  }

  async getByIds () {

  }
}

export default WOLFStar;
