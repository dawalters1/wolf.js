import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';
import TopicPageRecipeType from '../../constants/TopicPageRecipeType.js';

class Topic extends Base {
  /**
   * Get a topic page
   * @param {String} name
   * @param {Number} languageId
   * @returns {Promise<Response<object>>}
   */
  async getTopicPageLayout (name, languageId) {
    if (validator.isNullOrWhitespace(name)) {
      throw new models.WOLFAPIError('name cannot be null or empty', { name });
    }

    if (validator.isNullOrUndefined(languageId)) {
      throw new models.WOLFAPIError('languageId cannot be null or undefined', { languageId });
    } else if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (validator.isLessThanOrEqualZero(languageId)) {
      throw new models.WOLFAPIError('languageId cannot be less than or equal to 0', { languageId });
    }

    return await this.client.websocket.emit(
      Command.TOPIC_PAGE_LAYOUT,
      {
        name,
        languageId: parseInt(languageId)
      }
    );
  }

  /**
   * Get a topic page recipe list
   * @param {Number} id
   * @param {Number} languageId
   * @param {Number} maxResults
   * @param {Number} offset
   * @param {TopicPageRecipeType} type
   * @returns {Promise<Response<Array<object>>>}
   */
  async getTopicPageRecipeList (id, languageId, maxResults, offset, type) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (validator.isNullOrUndefined(languageId)) {
      throw new models.WOLFAPIError('languageId cannot be null or undefined', { languageId });
    } else if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (validator.isLessThanOrEqualZero(languageId)) {
      throw new models.WOLFAPIError('languageId cannot be less than or equal to 0', { languageId });
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

    if (validator.isNullOrWhitespace(type)) {
      throw new models.WOLFAPIError('type cannot be null or empty', { type });
    } else if (!Object.values(TopicPageRecipeType).includes(type)) {
      throw new models.WOLFAPIError('type is not valid', { type });
    }

    return await this.client.websocket.emit(
      Command.TOPIC_PAGE_RECIPE_LIST,
      {
        id: parseInt(id),
        languageId: parseInt(languageId),
        maxResults: parseInt(maxResults),
        offset: parseInt(offset),
        type
      }
    );
  }
}

export default Topic;
