import Base from './Base.js';
import TopicSectionVideo from './TopicSectionVideo.js';
import Validity from './Validity.js';
import WOLFAPIError from './WOLFAPIError.js';

class DiscoverySection extends Base {
  constructor (client, data, languageId, fromSubPage = false) {
    super(client);

    this.id = data.id;
    this.languageId = languageId;
    this.validity = data.validity ? new Validity(client, data?.validity) : undefined;

    const elements = data.elementList;

    const sectionTitle = elements.find((element) => element.type === 'sectionTitle');
    const heading = elements.find((element) => element.type === 'heading');
    const images = elements.filter((element) => element.type === 'image');
    const videos = elements.filter((element) => element.type === 'video');
    const descriptions = elements.filter((element) => element.type === 'text');

    this.sectionTitle = sectionTitle?.properties?.text;
    this.title = heading?.properties?.text;
    this.images = images.length ? images?.map((image) => image.properties.url) : undefined;
    this.description = descriptions[0]?.properties?.text;
    this.videos = videos.length ? videos.map((video) => new TopicSectionVideo(client, video)) : undefined;
    this.additionalDescriptions = descriptions.length > 1 ? descriptions?.slice(1)?.map((description) => description?.properties?.text).filter(Boolean) : undefined;

    const collection = elements.find((element) => element.type === 'collection');

    if (collection) {
      const page = heading?.properties?.link?.url?.split('/').slice(-1)[0];

      (!fromSubPage && page)
        ? this.page = page
        : this.recipe = {
          ...collection.properties.recipe,
          type: collection.properties.type.replace('groupEvent', 'event')
        };
    }
  }

  async get (offset = 0) {
    if (!this.page && !this.recipe) {
      throw new WOLFAPIError(`${this.title} is not a collection section`, { page: this.toJSON() });
    }

    if (this.page) {
      const page = await this.client.discovery._getPage(this.page, this.languageId);

      if (page.sections.length === 1 && page.sections[0].recipe) {
        return await page.get(offset);
      }

      return page;
    }

    return await this.client.discovery._getAppropriateRecipeItems(this.recipe.id, this.languageId, this.recipe.max, offset, this.recipe.type);
  }

  toJSON () {
    return {
      id: this.id,
      languageId: this.languageId,
      validity: this.validity,
      sectionTitle: this.sectionTitle,
      title: this.title,
      images: this.images,
      videos: this.videos?.map((video) => video.toJSON()),
      description: this.description,
      additionalDescriptions: this.additionalDescriptions
    };
  }
}

export default DiscoverySection;
