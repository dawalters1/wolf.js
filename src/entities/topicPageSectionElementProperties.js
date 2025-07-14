
import BaseEntity from './baseEntity.js';
import ExpiringProperty from '../managers/expiringProperty.js';
import TopicPageRecipeType from '../constants/TopicPageRecipeType.js';
import TopicPageSectionElementPropertyAspect from './topicPageSectionElementPropertyAspect.js';
import TopicPageSectionElementPropertyLink from './topicPageSectionElementPropertyLink.js';
import TopicPageSectionElementPropertyRecipe from './topicPageSectionElementPropertyRecipe.js';

export class TopicPageSectionElementProperties extends BaseEntity {
  constructor (client, entity, languageId) {
    super(client);

    this.type = entity.type;
    this.onInvalid = entity?.onInvalid ?? null;
    this.size = entity?.size ?? null;
    this.style = entity?.style ?? null;
    this.context = entity?.context ?? null;
    this.refreshSeconds = entity.refreshSeconds ?? null;
    this.text = entity?.text ?? null;
    this.aspect = entity?.aspect
      ? new TopicPageSectionElementPropertyAspect(this.client, entity.aspect)
      : null;
    this.recipe = entity?.recipe
      ? new TopicPageSectionElementPropertyRecipe(this.client, entity.recipe, this.type, languageId)
      : null;
    this.link = entity?.link
      ? new TopicPageSectionElementPropertyLink(this.client, entity.link)
      : null;
    this.heading = entity?.heading ?? null;
    this.subHeading = entity?.subHeading ?? null;
    this.body = entity?.body ?? null;
    this.imageUrl = entity?.imageUrl ?? null;

    this._recipeData = entity.recipe
      ? new ExpiringProperty(300)
      : null;
  }

  async getRecipe () {
    if (this._recipeData.value) {
      return this._recipeData.value.values();
    }

    this._recipeData.value = await this.client.topic.recipe.get(this.recipe.id, this.recipe.max, this.recipe.languageId, this.recipe.type);

    return this._recipeData.value;
  }

  async getRecipeProfiles () {
    const recipeData = await this.getRecipe();

    if (!recipeData.length) { return []; }

    return await (async () => {
      const ids = recipeData.map((topicRecipe) => topicRecipe.id);
      switch (this.type) {
        case TopicPageRecipeType.EVENT:
        case TopicPageRecipeType.LIVE_EVENT:
          return await this.client.event.getByIds(ids);
        case TopicPageRecipeType.USER:
          return await this.client.user.getByIds(ids);
        case TopicPageRecipeType.CHANNEL:
          return await this.client.channel.getByIds(ids);
        case TopicPageRecipeType.PRODUCT:
          return await this.client.store.product.getByIds(ids, this.recipe.languageId);
        default:
          throw new Error(`TopicPageRecipeType ${this.type} is not supported`);
      }
    }
    )();
  }
}

export default TopicPageSectionElementProperties;
