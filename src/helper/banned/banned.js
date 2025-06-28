import BaseHelper from '../baseHelper.js';

class BannedHelper extends BaseHelper {
  list () {
    return this.cache?.values();
  }

  isBanned (userIds) {
    const has = (userId) => this.cache.has(userId);
    return Array.isArray(userIds)
      ? userIds.map((userId) => has(userId))
      : has(userIds);
  }

  async ban (userId) {
    const user = await this.client.user.getById(userId);
    if (user === null) { throw new Error(`User with id ${userId} not found`); }
    return !!this.cache.set(user);
  }

  async banAll (userIds) {
    const users = await this.client.user.getByIds(userIds);
    const missingUserIds = userIds.filter(
      (userId) => !users.some((user) => user?.id === userId)
    );
    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }
    return users.map((user) => !!this.cache.set(user));
  }

  unban (userId) {
    return this.cache.delete(userId);
  }

  unbanAll (userIds) {
    return userIds.map((userId) => this.cache.delete(userId));
  }

  clear () {
    return this.cache.clear();
  }
}

export default BannedHelper;
