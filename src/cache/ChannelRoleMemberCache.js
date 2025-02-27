
import Base from './Base.js';

class ChannelRoleMemberCache extends Base {
  constructor () {
    super();

    this.fetched = new Map(); // ChannelId Boolean
  }

  get (channelId) {
    return this.cache.get(channelId)?.values() ?? null;
  }

  set (channelId, members) {
    const cache = this.cache.get(channelId) ?? this.cache.set(channelId, new Map()).get(channelId);

    const result = (Array.isArray(members) ? members : [members])
      .reduce((results, member) => {
        const existing = this.cache.get(member.id);

        results.push(
          cache.set(
            member.id,
            existing?._patch(member) ?? member

          ).get(member.id)
        );

        return results;
      }, []);

    return Array.isArray(members) ? result : result[0];
  }

  delete (channelId, userId) {
    if (userId === null) {
      return this.cache.delete(channelId);
    }

    return this.cache.get(channelId)?.delete(userId);
  }
}

export default ChannelRoleMemberCache;
