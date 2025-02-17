import CacheInstanceType from '../../constants/CacheInstanceType.js';
import Base from '../Base.js';

class Charm extends Base {
  constructor (client) {
    super(client);

    this.cache = new Cache('id', CacheInstanceType.MAP);
  }
}

export default Charm;
