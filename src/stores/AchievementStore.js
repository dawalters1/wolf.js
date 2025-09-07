import BaseStore from './BaseStore.js';
import Store from './Store.js';

class AchievementStore extends BaseStore {
  /**
   *
   * @param {*} languageId
   * @returns {Map<number, Achievement>|null}
   */
  get (languageId) {
    return this.store.get(languageId) ?? null;
  }

  /**
   *
   * @param {*} languageId
   * @param {*} achievement
   * @returns  {Map<number, Achievement>|null}
   */
  set (languageId, achievement, maxAge = null) {
    const cache = this.store.get(languageId) ?? this.store.set(languageId, new Store()).get(languageId);

    const existing = cache.get(achievement.id);

    return cache
      .set(achievement.id,
        existing?.patch(achievement) ?? achievement,
        maxAge
      )
      .get(achievement.id);
  }

  invalidate (languageId, id) {
    const store = this.store.get(languageId);

    if (!store) { return; }

    store.delete(id);
  }
}

export default AchievementStore;
