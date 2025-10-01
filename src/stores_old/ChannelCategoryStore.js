import BaseStore from './BaseStore.js';

class ChannelCategoryStore extends BaseStore {
  /**
   *
   * @param {*} languageId
   * @returns {Map<number, ChannelCategory>|null}
   */
  get (languageId) {
    return this.store.get(languageId) ?? null;
  }

  /**
   *
   * @param {*} languageId
   * @param {*} achievementCategories
   * @returns  {Map<number, ChannelCategory>|null}
   */
  set (languageId, achievementCategories, maxAge = null) {
    return this.store.set(
      languageId,
      new Map(achievementCategories.map((achievementCategories) => [achievementCategories.id, achievementCategories])),
      maxAge
    ).get(languageId);
  }
}

export default ChannelCategoryStore;
