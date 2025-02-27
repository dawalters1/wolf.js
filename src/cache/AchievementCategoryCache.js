import ExpiryMap from 'expiry-map';
import Base from './Base.js';

class AchievementCategoryCache extends Base {
  get (languageId, categoryIds = null) {
    const cache = this.cache.get(languageId) ?? null;

    if (categoryIds === null) { return cache?.values() ?? null; }

    const result = (Array.isArray(categoryIds) ? categoryIds : [categoryIds]).map((categoryId) => cache?.get(categoryId) ?? null);

    return Array.isArray(categoryIds) ? result : result[0];
  }

  async set (languageId, categories) {
    const cache = this.cache.get(languageId) ?? this.cache.set(languageId, new ExpiryMap(3600)).get(languageId);

    const result = (Array.isArray(categories) ? categories : [categories])
      .reduce((results, category) => {
        const existing = cache.get(category.id);

        results.push(
          cache.set(
            category.id,

            existing?._patch(category) ?? category
          ).get(category.id));

        return results;
      }, []);

    return Array.isArray(categories) ? result : result[0];
  }

  async delete (languageId, categoryId = null) {
    if (categoryId === null) {
      return this.cache.delete(languageId);
    }

    return this.cache.get(languageId)?.delete(categoryId);
  }
}

export default AchievementCategoryCache;
