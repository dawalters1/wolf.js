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

    const elements = [...new Set(data.elementList.map((element) => element.type))]
      .reduce((result, value) => {
        result[value] = data.elementList.filter((ele) => ele.type === value);

        return result;
      }, {});

    const sectionTitle = elements.sectionTitle[0];
    const heading = elements.heading[0];
    const images = elements.image;
    const videos = elements.video;
    const descriptions = elements.text;

    this.sectionTitle = sectionTitle?.properties?.text;
    this.title = heading?.properties?.text;
    this.images = images.length ? images?.map((image) => image.properties.url) : undefined;
    this.description = descriptions[0]?.properties?.text;
    this.videos = videos.length ? videos.map((video) => new TopicSectionVideo(client, video)) : undefined;
    this.additionalDescriptions = descriptions.length > 1 ? descriptions?.slice(1)?.map((description) => description?.properties?.text).filter(Boolean) : undefined;

    const collection = elements.collection[0];

    if (collection === undefined) { return false; }

    const page = heading?.properties?.link?.url?.split('/').slice(-1)[0];

    (!fromSubPage && page)
      ? this.page = page
      : this.recipe = {
        ...collection.properties.recipe,
        type: collection.properties.type.replace('groupEvent', 'event')
      };
  }

  /**
   * Get the page, event, product or channels belonging to the section
   * @param offset
   * @returns {Promise<DiscoveryPage | Array<Channel> | Array<StoreProductPartial> | Array<Event>>}
   */
  async get (offset = 0) {
    if (!this.page && !this.recipe) {
      throw new WOLFAPIError(`${this.title} is not a collection section`, { page: this.toJSON() });
    }

    if (this.page === undefined) {
      return await this.client.discovery._getAppropriateRecipeItems(this.recipe.id, this.languageId, this.recipe.max, offset, this.recipe.type);
    }

    const page = await this.client.discovery._getPage(this.page, this.languageId);

    return page.sections.length === 1 && page.sections[0].recipe ? await page.get(offset) : page;
  }

  toJSON () {
    const json = {
      id: this.id,
      languageId: this.languageId,
      validity: this.validity,
      title: this.title,
      images: this.images,
      videos: this.videos?.map((video) => video.toJSON()),
      description: this.description,
      additionalDescriptions: this.additionalDescriptions
    };

    if (this.page) {
      json.page = this.page;
    }

    if (this.recipe) {
      json.recipe = this.recipe;
    }

    return json;
  }
}

export default DiscoverySection;
