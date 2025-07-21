import CacheManager from './cacheManager.js';

class TopicRecipeManager extends CacheManager {
  set (recipeId, languageId, values) {
    return this.store.set(`${recipeId}.languageId:${languageId}`, values);
  }

  get (recipeId, languageId) {
    return this.store.get(`${recipeId}.languageId:${languageId}`) ?? null;
  }
}

export default TopicRecipeManager;
