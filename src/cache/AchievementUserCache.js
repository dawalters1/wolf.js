import Base from './Base.js';

class AchievementUserCache extends Base {
  constructor () {
    super(300);
  }

  get (userId) {
    return this.cache.get(userId)?.values() ?? null;
  }

  set (userId, achievements) {
    const cache = this.cache.get(userId) ?? this.cache.set(userId, new Map()).get(userId);

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

  delete (userId) {
    return this.cache.delete(userId);
  }
}

export default AchievementUserCache;
