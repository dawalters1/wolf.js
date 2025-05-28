/* eslint-disable @typescript-eslint/no-non-null-assertion */

import WOLF from '../../client/WOLF.ts';
import CacheManager from '../../managers/cacheManager.ts';
import Base from '../base.ts';

class BannedHelper extends Base<CacheManager<number, Set<number>>> {
  constructor (client: WOLF) {
    super(client, new CacheManager(new Set<number>()));
  }

  list () {
    return this.cache?.values();
  }

  isBanned (userIds: number | number[]): boolean | boolean[] {
    const has = (userId: number) => this.cache!.has(userId);

    return Array.isArray(userIds)
      ? userIds.map((userId) => has(userId))
      : has(userIds);
  }

  ban (userIds: number | number[]): boolean | boolean[] {
    return Array.isArray(userIds)
      ? userIds.map((userId) => this.cache!.add(userId))
      : this.cache!.add(userIds);
  }

  unban (userIds: number | number[]): boolean | boolean[] {
    return Array.isArray(userIds)
      ? userIds.map((userId) => this.cache!.add(userId))
      : this.cache!.add(userIds);
  }

  clear () {
    return this.cache!.clear();
  }
}

export default BannedHelper;
