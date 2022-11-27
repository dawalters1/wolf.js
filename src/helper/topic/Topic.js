const BaseHelper = require('../BaseHelper');

const validator = require('../../validator');
const { Commands, TopicPageRecipeType, Language } = require('../../constants');

class Topic extends BaseHelper {
  async getTopicPageLayout (name, languageId) {
    try {
      if (validator.isNullOrWhitespace(name)) {
        throw Error('name cannot be null or empty');
      }

      if (!validator.isValidNumber(languageId)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(Language).includes(languageId)) {
        throw new Error('language is not valid');
      }

      return await this._websocket.emit(
        Commands.TOPIC_PAGE_LAYOUT,
        {
          name,
          languageId: parseInt(languageId)
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.subscriber().wolfstar().getById(name=${JSON.stringify(name)}, languageId=${JSON.stringify(languageId)})`;
    }
  }

  async getTopicPageRecipeList (id, languageId, maxResults, offset, type) {
    try {
      if (validator.isNullOrUndefined(id)) {
        throw Error('id cannot be null or undefined');
      } else if (!validator.isValidNumber(id)) {
        throw Error('id must be a valid number');
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw Error('id cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(languageId)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(Language).includes(languageId)) {
        throw new Error('language is not valid');
      }

      if (validator.isNullOrUndefined(maxResults)) {
        throw Error('maxResults cannot be null or undefined');
      } else if (!validator.isValidNumber(maxResults)) {
        throw Error('maxResults must be a valid number');
      } else if (validator.isLessThanOrEqualZero(maxResults)) {
        throw Error('maxResults cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(offset)) {
        throw Error('offset cannot be null or undefined');
      } else if (!validator.isValidNumber(offset)) {
        throw Error('offset must be a valid number');
      } else if (validator.isLessThanZero(offset)) {
        throw Error('offset cannot be less than 0');
      }

      if (validator.isNullOrWhitespace(type)) {
        throw Error('type cannot be null or empty');
      } else if (!Object.values(TopicPageRecipeType).includes(type)) {
        throw Error('type is not valid');
      }

      return await this._websocket.emit(
        Commands.TOPIC_PAGE_RECIPE_LIST,
        {
          id: parseInt(id),
          languageId: parseInt(languageId),
          maxResults: parseInt(maxResults),
          offset: parseInt(offset),
          type
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.topic.getTopicPageRecipeList(id=${JSON.stringify(id)}, languageId=${JSON.stringify(languageId)}, maxResults=${JSON.stringify(maxResults)}, offset=${JSON.stringify(offset)}, type=${JSON.stringify(type)})`;
    }
  }
}

module.exports = Topic;
