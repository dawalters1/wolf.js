import BaseHelper from '../baseHelper.js';

class AuthorisationHelper extends BaseHelper {
  list () {
    return this.cache?.values();
  }

  isAuthorised (userIds) {
    const has = (userId) => this.cache.has(userId);
    return Array.isArray(userIds)
      ? userIds.map((userId) => has(userId))
      : has(userIds);
  }

  async authorise (userId) {
    const user = await this.client.user.getById(userId);
    if (user === null) { throw new Error(''); }
    return !!this.cache.set(user);
  }

  async authoriseAll (userIds) {
    const users = await this.client.user.getByIds(userIds);
    const missingUserIds = userIds.filter(
      (userId) => !users.some((user) => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }

    return users.map((user) => !!this.cache.set(user));
  }

  deauthorise (userId) {
    return this.cache.delete(userId);
  }

  deauthoriseAll (userIds) {
    return userIds.map((userId) => this.cache.delete(userId));
  }

  unauthorise = this.deauthorise;

  clear () {
    return this.cache.clear();
  }
}

export default AuthorisationHelper;
