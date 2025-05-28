/* eslint-disable @typescript-eslint/no-non-null-assertion */

import WOLF from '../../client/WOLF.ts';
import CacheManager from '../../managers/cacheManager.ts';
import Base from '../base.ts';

class AuthorisationHelper extends Base<CacheManager<number, Set<number>>> {
  constructor (client: WOLF) {
    super(client, new CacheManager(new Set()));
  }

  list () {
    return this.cache?.values();
  }

  isAuthorised (userIds: number | number[]): boolean | boolean[] {
    const has = (userId: number) => this.cache!.has(userId);

    return Array.isArray(userIds)
      ? userIds.map((userId) => has(userId))
      : has(userIds);
  }

  authorise (userIds: number | number[]): boolean | boolean[] {
    return Array.isArray(userIds)
      ? userIds.map((userId) => this.cache!.add(userId))
      : this.cache!.add(userIds);
  }

  deauthorise (userIds: number | number[]): boolean | boolean[] {
    return Array.isArray(userIds)
      ? userIds.map((userId) => this.cache!.add(userId))
      : this.cache!.add(userIds);
  }

  unauthorise = this.deauthorise;

  clear () {
    return this.cache!.clear();
  }
}

export default AuthorisationHelper;
