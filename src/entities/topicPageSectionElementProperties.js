
import BaseEntity from './baseEntity.js';
import ExpiringProperty from '../stores_old/expiringProperty.js';
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
}

export default TopicPageSectionElementProperties;
