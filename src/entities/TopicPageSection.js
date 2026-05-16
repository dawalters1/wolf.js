import BaseEntity from './BaseEntity.js';
import ExperienceContextType from '../constants/ExperienceContextType.js';
import TopicPageRecipeType from '../constants/TopicPageRecipeType.js';
import TopicPageSectionColour from './TopicPageSectionColour.js';
import TopicPageSectionElement from './TopicPageSectionElement.js';
import TopicPageSectionValidity from './TopicPageSectionValidity.js';

export default class TopicPageSection extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.id = entity.id;
    this.languageId = entity.languageId;
    this.validity = entity?.validity
      ? new TopicPageSectionValidity(this.client, entity.validity)
      : null;
    this.colour = entity.colour
      ? new TopicPageSectionColour(this.client, entity.colour)
      : null;
    this.elementList = entity.elementList
      ? new Set(
        entity.elementList.map((element) => {
          element.languageId = this.languageId;
          return new TopicPageSectionElement(this.client, element);
        })
      )
      : null;
  }

  async fetch (opts) {
    const elements = [...this.elementList.values()];

    const collection = elements.find((item) => item.type === 'collection');

    if (!collection) { throw new Error(`No Collection element in Topic Page Section with ID ${this.id}`); }

    const heading = elements.find((item) => item.type === 'heading') ?? null;

    if (!heading?.properties?.link?.topicPageName) {
      const properties = collection.properties;

      if (!properties?.link?.topicPageName) {
        const recipe = await this.client.topic.recipe.fetch(properties.recipe.id, this.languageId, properties.type, {
          ...opts,
          // Force a cap for channel and user otherwise '429'
          maxResults: [TopicPageRecipeType.CHANNEL, TopicPageRecipeType.USER].includes(properties.type)
            ? 50
            : undefined
        });

        const ids = [...new Set(recipe.map((item) => item.id))];

        switch (properties.type) {
          case TopicPageRecipeType.EVENT:
          case TopicPageRecipeType.LIVE_EVENT:
            return await this.client.event.fetch(ids, opts);
          case TopicPageRecipeType.USER:
            return await this.client.subscriber.fetch(ids, opts);
          case TopicPageRecipeType.CHANNEL:
            return await this.client.channel.fetch(ids, opts);
          case TopicPageRecipeType.PRODUCT:
            return await this.client.store.product.fetch(ids, this.languageId, opts);
          case TopicPageRecipeType.EXPERIENCE:
            return await this.client.experience.fetch(this.languageId, ExperienceContextType.GLOBAL, undefined, ids, opts);
          default:
            throw new Error(`Type '${properties.type}' is not yet supported, please create a github issue`);
        }
      }
    }

    return await this.client.topic.fetch(heading.properties.link.topicPageName, this.languageId, opts);
  }
}
