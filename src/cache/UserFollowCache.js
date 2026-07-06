
import Cache from './Cache.js';
import PropertyCache from './PropertyCache.js';

export default class FollowStore {
  #followers = {
    count: new PropertyCache({ ttl: 15 }),
    list: new Cache({ ttl: 3600 })
  };

  #following = {
    count: new PropertyCache({ ttl: 15 }),
    list: new Cache({ ttl: 3600 })
  };

  get followers () {
    return this.#followers;
  }

  get following () {
    return this.#following;
  }
}
