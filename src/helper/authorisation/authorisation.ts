/* eslint-disable @typescript-eslint/no-non-null-assertion */

import WOLF from '../../client/WOLF.ts';
import CacheManager from '../../managers/cacheManager.ts';
import BaseHelper from '../baseHelper.ts';
import {User} from "../../structures/user.ts";

class AuthorisationHelper extends BaseHelper<User> {
  constructor(client: WOLF) {
    super(client);
  }

  list() {
    return this.cache?.values();
  }

  isAuthorised(userIds: number | number[]): boolean | boolean[] {
    const has = (userId: number) => this.cache.has(userId);

    return Array.isArray(userIds)
      ? userIds.map((userId) => has(userId))
      : has(userIds);
  }

  async authorise(userId: number): Promise<boolean> {
    const user = await this.client.user.getById(userId)
    return !!this.cache.set(user)
  }

  async authoriseAll(userIds: number[]): Promise<boolean[]> {
    const users = await this.client.user.getAllById(userIds)
    return users.map((user) => !!this.cache.set(user))
  }


  deauthorise(userId: number): boolean {
    return this.cache.delete(userId)
  }

  deauthoriseAll(userIds: number[]): boolean[] {
    return userIds.map((userId) => this.cache.delete(userId))
  }

  unauthorise = this.deauthorise;

  clear() {
    return this.cache.clear();
  }
}

export default AuthorisationHelper;
