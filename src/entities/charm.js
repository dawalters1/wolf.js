
import BaseEntity from './baseEntity.js';

class Charm extends BaseEntity {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.cost = data.cost;
    this.description = new Map([[data.languageId, data.description]]);
    this.imageUrl = data.imageUrl;
    this.name = new Map([[data.languageId, data.name]]);
    this.productId = data.productId;
    this.languages = new Set([data.languageId]);
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.cost = entity.cost;
    this.description.set(entity.languageId, entity.description);
    this.imageUrl = entity.imageUrl;
    this.name.set(entity.languageId, entity.name);
    this.productId = entity.productId;
    this.languages.add(entity.languageId);
    return this;
  }

  /**
 * Check if the language exists based on its ID.
 **
 * @param {*} languageId The languageId parameter to check if it exists in the languages set.
 * @returns {boolean} Check if the language exists based on the language Id.
 */
  hasLanguage (languageId) {
    return this.languages.has(languageId);
  }
}

export default Charm;
