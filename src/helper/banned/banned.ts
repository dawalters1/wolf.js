import BaseHelper from '../baseHelper.ts';
import { User } from '../../structures/user.ts';

class BannedHelper extends BaseHelper<User> {
  list () {
    return this.cache?.values();
  }

  isBanned (userIds: number | number[]): boolean | boolean[] {
    const has = (userId: number) => this.cache.has(userId);

    return Array.isArray(userIds)
      ? userIds.map((userId) => has(userId))
      : has(userIds);
  }

  async ban (userId: number): Promise<boolean> {
    const user = await this.client.user.getById(userId);
    return !!this.cache.set(user);
  }

  async banAll (userIds: number[]): Promise<boolean[]> {
    const users = await this.client.user.getAllById(userIds);
    return users.map((user) => !!this.cache.set(user));
  }

  unban (userId: number): boolean {
    return this.cache.delete(userId);
  }

  unbanAll (userIds: number[]): boolean[] {
    return this.cache.deleteAll(userIds);
  }

  clear () {
    return this.cache.clear();
  }
}

export default BannedHelper;
