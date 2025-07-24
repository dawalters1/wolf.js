import CacheManager from '../managers/cacheManager.js';

class BaseHelper {
  /**
   * @param {any} client
   * @param {number|null} ttl
   * @param {'default'|'language'} cacheType
   */
  constructor (client, ttl = null) {
    this.client = client;

    this.cacheManager = new CacheManager(ttl);
  }

  get cache () {
    return this.cacheManager;
  }

  createKey (key, languageId) {
    return languageId
      ? `${key}.languageId:${languageId}`
      : key;
  }
}

export default BaseHelper;
