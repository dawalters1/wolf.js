
import BaseEntity from './baseEntity.js';
import TopicPageSectionElementProperties from './topicPageSectionElementProperties.js';

export class TopicPageSectionElement extends BaseEntity {
  constructor (client, entity, languageId) {
    super(client);

    this.onInvalid = entity?.onInvalid ?? null;
    this.properties = entity.properties
      ? new TopicPageSectionElementProperties(this.client, entity.properties, languageId)
      : null;
    this.type = entity.type;
  }

  async getRecipe () {
    if (this.properties && this.properties.recipe !== null) {
      return this.properties.getRecipe();
    }
    throw new Error('No recipe');
  }

  async getRecipeProfiles () {
    if (this.properties && this.properties.recipe !== null) {
      return this.properties.getRecipeProfiles();
    }
    throw new Error('No recipe');
  }
}

export default TopicPageSectionElement;
