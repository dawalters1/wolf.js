import CacheManager from '../managers/cacheManager.js';

class BaseHelper {
  constructor (client, ttl = null) {
    this.client = client;
    this.cacheManager = new CacheManager(ttl);
  }

  get cache () {
    return this.cacheManager;
  }
}

export default BaseHelper;
