import WOLF from '../client/WOLF.ts';
import CacheManager from '../managers/cacheManager.ts';
import BaseEntity from '../structures/baseEntity.ts';

class BaseHelper<T extends BaseEntity> {
  client: WOLF;
  protected cacheManager: CacheManager<T> = new CacheManager();

  constructor (client: WOLF) {
    this.client = client;
  }

  get cache () {
    return this.cacheManager;
  }
}

export default BaseHelper;
