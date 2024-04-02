import Base from '../Base.js';
import validator from '../../validator/index.js';
import models, { WOLFAPIError } from '../../models/index.js';
import { Language } from '../../constants/index.js';
import TopicPageRecipeType from '../../constants/TopicPageRecipeType.js';

class Discovery extends Base {
  constructor (client) {
    super(client);

    // TODO: MAP
    this.discovery = {};
  }

  /**
   * Request a page
   * @param {string} page  - The page to request
   * @param {Language} languageId  - The language ID to request
   * @param {Boolean} forceNew - Whether or not to request new from the server
   * @internal - Recommended for internal use only, use client.topic.getTopicPageLayout(...) instead
   * @returns Returns requested page if exists
   */
  async _getPage (page, languageId, forceNew = false) {
    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new models.WOLFAPIError('languageId is not valid', { languageId });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this.discovery[languageId]?.pages[page]) {
      return this.discovery[languageId]?.pages[page];
    }

    const response = await this.client.topic.getTopicPageLayout(page, languageId);

    if (response.success) {
      this.discovery[languageId] = {
        ...this.discovery[languageId],
        pages: {
          ...this.discovery[languageId]?.pages,
          [page]: new models.DiscoveryPage(this.client, response.body, languageId)
        }
      };
    }

    return this.discovery[languageId]?.pages[page];
  }

  async _getAppropriateRecipeItems (id, languageId, maxResults, offset, type) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new models.WOLFAPIError('languageId is not valid', { languageId });
    }

    if (validator.isNullOrUndefined(maxResults)) {
      throw new models.WOLFAPIError('maxResults cannot be null or undefined', { maxResults });
    } else if (!validator.isValidNumber(maxResults)) {
      throw new models.WOLFAPIError('maxResults must be a valid number', { maxResults });
    } else if (validator.isLessThanOrEqualZero(maxResults)) {
      throw new models.WOLFAPIError('maxResults cannot be less than or equal to 0', { maxResults });
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new models.WOLFAPIError('offset cannot be null or undefined', { offset });
    } else if (!validator.isValidNumber(offset)) {
      throw new models.WOLFAPIError('offset must be a valid number', { offset });
    } else if (validator.isLessThanZero(offset)) {
      throw new models.WOLFAPIError('offset cannot be less than 0', { offset });
    }

    if (validator.isNullOrUndefined(type)) {
      throw new models.WOLFAPIError('type cannot be null or undefined', { type });
    } else if (!Object.values(TopicPageRecipeType).includes(type)) {
      throw new models.WOLFAPIError('type is not valid', { type });
    }

    const topicRecipeIds = (await this.client.topic.getTopicPageRecipeList(id, languageId, maxResults, offset, type)).body?.map((productPartial) => productPartial.id) ?? [];

    switch (type) {
      case TopicPageRecipeType.EVENT:
      case TopicPageRecipeType.LIVE_EVENT:
        return await this.client.event.getByIds(topicRecipeIds, languageId);
      case TopicPageRecipeType.USER:
        return await this.client.subscriber.getByIds(topicRecipeIds);
      case TopicPageRecipeType.GROUP:
        return await this.client.channel.getByIds(topicRecipeIds);
      case TopicPageRecipeType.PRODUCT:
        return await this.client.store.getProducts(topicRecipeIds, languageId);
      default:
        throw new WOLFAPIError('type is not yet supported', { type });
    }
  }

  async get (languageId, forceNew = false) {
    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new models.WOLFAPIError('languageId is not valid', { languageId });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this.discovery[languageId]?.main) {
      return this.discovery[languageId].main;
    }

    const response = await this.client.topic.getTopicPageLayout('discover', languageId);

    if (response.success) {
      this.discovery[languageId] = {
        main: new models.Discovery(this.client, response.body, languageId),
        pages: {
          ...this.discovery[languageId]?.pages
        }
      };
    }

    return this.discovery[languageId]?.main;
  }

  _cleanUp (reconnection = false) {
    if (reconnection) { return; }

    this.discovery = {};
  }
}

export default Discovery;
