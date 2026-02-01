
import PropertyCache from './PropertyCache.js';

export default class FollowStore {
  #followers;
  #following;

  constructor () {
    this.#followers = {
      count: new PropertyCache({ ttl: 15 }),
      list: new Cache({ ttl: 3600 })
    };
    this.#following = {
      count: new PropertyCache({ ttl: 15 }),
      list: new Cache({ ttl: 3600 })
    };
  }

  /** @internal */
  get followers () {
    return this.#followers;
  }

  /** @internal */
  get following () {
    return this.#following;
  }
}
