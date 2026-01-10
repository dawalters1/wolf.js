
import BaseEntity from './baseEntity.js';

export class TopicPageSectionElementPropertyRecipe extends BaseEntity {
  constructor (client, entity, type, languageId) {
    super(client);

    this.id = entity?.id ?? null;
    this.min = entity?.min ?? null;
    this.max = entity.max ?? null;
    this.languageId = languageId;
    this.type = type;
  }
}

export default TopicPageSectionElementPropertyRecipe;
