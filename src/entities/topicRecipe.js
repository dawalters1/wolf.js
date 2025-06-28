import BaseEntity from './baseEntity.js';
import TopicRecipeAdditionalInfo from './topicRecipeAdditionalInfo.js';

export class TopicRecipe extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.additionalInfo = new TopicRecipeAdditionalInfo(this.client, entity.additionalInfo);
  }
}

export default TopicRecipe;
