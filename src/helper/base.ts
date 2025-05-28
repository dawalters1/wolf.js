import WOLF from '../client/WOLF.ts';
import CacheManager from '../managers/cacheManager.ts';

class Base<T extends CacheManager<any, Set<any> | Map<number, any>> | undefined = undefined> {
  client: WOLF;
  cache?: T;

  constructor (client: WOLF, cache?: T) {
    this.client = client;
    this.cache = cache;
  }
}

export default Base;
