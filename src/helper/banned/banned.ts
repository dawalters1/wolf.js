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

    if (user === null) { throw new Error(`User with id ${userId} not found`); }

    return !!this.cache.set(user);
  }

  async banAll (userIds: number[]): Promise<boolean[]> {
    const users = await this.client.user.getByIds(userIds);

    const missingUserIds = userIds.filter(
      (userId) => !users.some((user) => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return users.map((user) => !!this.cache.set(user!));
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
