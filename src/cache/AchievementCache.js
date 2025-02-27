
import ExpiryMap from 'expiry-map';
import Base from './Base.js';

class AchievementCache extends Base {
  /**
   * Gets all achievements for a langauge
   * @param {Language} languageId
   * @returns
   */
  async get (languageId, achievementIds = null) {
    const cache = this.cache.get(languageId) ?? null;

    if (achievementIds === null) { return cache?.values() ?? null; }

    const result = (Array.isArray(achievementIds) ? achievementIds : [achievementIds]).map((achievementId) => cache?.get(achievementId) ?? null);

    return Array.isArray(achievementIds) ? result : result[0];
  }

  async set (languageId, achievements) {
    const cache = this.cache.get(languageId) ?? this.cache.set(languageId, new ExpiryMap(3600)).get(languageId);

    const result = (Array.isArray(achievements) ? achievements : [achievements])
      .reduce((results, achievement) => {
        const existing = cache.get(achievement.id);

        results.push(
          cache.set(
            achievement.id,
            existing?._patch(achievement) ?? achievement
          )
            .get(achievement.id)
        );

        return results;
      }, []);

    return Array.isArray(achievements) ? result : result[0];
  }

  /**
   * Delete an achievement list by langaugeId
   * @param {Language} languageId
   * @returns
   */
  async delete (languageId, achievementId = null) {
    if (achievementId === null) {
      return this.cache.delete(languageId);
    }

    return this.cache.get(languageId)?.delete(achievementId);
  }
}

export default AchievementCache;
