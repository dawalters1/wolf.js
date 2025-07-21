
import BaseEntity from './baseEntity.js';

class Charm extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.languageId = entity.languageId;
    this.cost = entity.cost;
    this.description = entity.description;
    this.imageUrl = entity.imageUrl;
    this.name = entity.name;
    this.productId = entity.productId;
  }

  /** @internal */
  patch (entity) {
    this.id = entity.id;
    this.cost = entity.cost;
    this.description = entity.description;
    this.imageUrl = entity.imageUrl;
    this.name = entity.name;
    this.productId = entity.productId;

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
