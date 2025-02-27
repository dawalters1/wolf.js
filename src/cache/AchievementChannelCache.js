
import Base from './Base.js';

class AchievementChannelCache extends Base {
  constructor () {
    super(300);
  }

  get (channelId) {
    return this.cache.get(channelId)?.values() ?? null;
  }

  set (channelId, achievements) {
    const cache = this.cache.get(channelId) ?? this.cache.set(channelId, new Map()).get(channelId);

    const result = (Array.isArray(achievements) ? achievements : [achievements])
      .reduce((results, achievement) => {
        const existing = cache.get(achievement.id);

        results.push(
          cache.set(
            achievement.id,
            existing?._patch(achievement) ?? achievement
          ).get(achievement.id));

        return results;
      }, []);

    return Array.isArray(achievements) ? result : result[0];
  }

  delete (channelId) {
    return this.cache.delete(channelId);
  }
}

export default AchievementChannelCache;
