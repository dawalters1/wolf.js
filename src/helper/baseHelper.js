import CacheManager from '../managers/cacheManager.js';

class BaseHelper {
  constructor (client) {
    this.client = client;
    this.cacheManager = new CacheManager();
  }

  get cache () {
    return this.cacheManager;
  }
}

export default BaseHelper;
