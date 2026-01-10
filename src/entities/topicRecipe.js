import BaseEntity from './baseEntity.js';
import TopicPageRecipeType from '../constants/TopicPageRecipeType.js';
import TopicRecipeAdditionalInfo from './topicRecipeAdditionalInfo.js';

export class TopicRecipe extends BaseEntity {
  constructor (client, entity, type) {
    super(client);

    this.recipeId = entity.recipeId;
    this.id = entity.id;
    this.languageId = entity.languageId;
    this.additionalInfo = new TopicRecipeAdditionalInfo(this.client, entity.additionalInfo);
    this.type = type;
  }

  async get () {
    switch (this.type) {
      case TopicPageRecipeType.EVENT:
      case TopicPageRecipeType.LIVE_EVENT:
        return await this.client.event.getById(this.id, this.languageId);
      case TopicPageRecipeType.USER:
        return await this.client.user.getById(this.id);
      case TopicPageRecipeType.CHANNEL:
        return await this.client.channel.getById(this.id);
      case TopicPageRecipeType.PRODUCT:
        return await this.client.store.product.getById(this.id, this.languageId);
      default:
        throw new Error(`TopicPageRecipeType ${this.type} is not supported`);
    }
  }
}

export default TopicRecipe;
