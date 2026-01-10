import BaseEntity from './BaseEntity.js';
import TopicPageRecipeType from '../constants/TopicPageRecipeType.js';
import TopicRecipeAdditionalInfo from './TopicRecipeAdditionalInfo.js';

export class TopicRecipe extends BaseEntity {
  constructor (client, entity, type) {
    super(client);

    this.recipeId = entity.recipeId;
    this.id = entity.id;
    this.languageId = entity.languageId;
    this.additionalInfo = new TopicRecipeAdditionalInfo(this.client, entity.additionalInfo);
    this.type = type;
  }

  async fetch () {
    switch (this.type) {
      case TopicPageRecipeType.EVENT:
      case TopicPageRecipeType.LIVE_EVENT:
        return await this.client.event.fetch(this.id, this.languageId);
      case TopicPageRecipeType.USER:
        return await this.client.user.fetch(this.id);
      case TopicPageRecipeType.CHANNEL:
        return await this.client.channel.fetch(this.id);
      case TopicPageRecipeType.PRODUCT:
        return await this.client.store.product.fetch(this.id, this.languageId);
      default:
        throw new Error(`TopicPageRecipeType ${this.type} is not supported`);
    }
  }
}
