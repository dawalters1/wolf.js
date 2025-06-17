import BaseHelper from '../baseHelper.ts';
import { User } from '../../structures/user.ts';

class AuthorisationHelper extends BaseHelper<User> {
  list () {
    return this.cache?.values();
  }

  isAuthorised (userIds: number | number[]): boolean | boolean[] {
    const has = (userId: number) => this.cache.has(userId);

    return Array.isArray(userIds)
      ? userIds.map((userId) => has(userId))
      : has(userIds);
  }

  async authorise (userId: number): Promise<boolean> {
    const user = await this.client.user.getById(userId);
    if (user === null) { throw new Error(''); }
    return !!this.cache.set(user);
  }

  async authoriseAll (userIds: number[]): Promise<boolean[]> {
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

  deauthorise (userId: number): boolean {
    return this.cache.delete(userId);
  }

  deauthoriseAll (userIds: number[]): boolean[] {
    return userIds.map((userId) => this.cache.delete(userId));
  }

  unauthorise = this.deauthorise;

  clear () {
    return this.cache.clear();
  }
}

export default AuthorisationHelper;
