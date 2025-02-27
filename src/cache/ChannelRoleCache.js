import Base from './Base.js';

class ChannelRoleCache extends Base {
  constructor () {
    super(300);
  }

  get (channelId) {
    return this.cache.get(channelId)?.values() ?? null;
  }

  set (channelId, roles) {
    const cache = this.cache.get(channelId) ?? this.cache.set(channelId, new Map()).get(channelId);

    const result = (Array.isArray(roles) ? roles : [roles])
      .reduce((results, role) => {
        const existing = this.cache.get(role.id);

        results.push(
          cache.set(
            role.id,
            existing?._patch(role) ?? role

          ).get(role.id)
        );

        return results;
      }, []);

    return Array.isArray(roles) ? result : result[0];
  }

  delete (channelId, roleId = null) {
    if (roleId === null) {
      return this.cache.delete(channelId);
    }

    return this.cache.get(channelId)?.delete(roleId);
  }
}

export default ChannelRoleCache;
