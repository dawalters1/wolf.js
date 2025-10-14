// import TopicRecipeManager from '../../stores_old/topicRecipeManager.js';

import BaseStore from '../../caching/BaseStore.js';
import Command from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { StatusCodes } from 'http-status-codes';
import { TopicPageRecipeType } from '../../constants/index.js';
import TopicRecipe from '../../entities/topicRecipe.js';
import { validate } from '../../validator/index.js';

class TopicRecipeHelper extends BaseStore {
  async get (id, languageId, type, opts) {
    id = Number(id) || id;
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      validate(id)
        .isNotNullOrUndefined('TopicRecipeHelper.get() parameter, productId[{index}]: {value} is null or undefined')
        .isValidNumber('TopicRecipeHelper.get() parameter, productId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'TopicRecipeHelper.get() parameter, productId[{index}]: {value} is less than or equal to zero');

      validate(languageId)
        .isNotNullOrUndefined(`TopicRecipeHelper.get() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `TopicRecipeHelper.get() parameter, languageId: ${languageId} is not valid`);

      validate(type)
        .isNotNullOrUndefined(`TopicRecipeHelper.get() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(TopicPageRecipeType, `TopicRecipeHelper.get() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'TopicRecipeHelper.get() parameter, opts.{parameter}: {value} {error}');
    }

    if (!opts?.forceNew) {
      const cachedTopicRecipies = this.store.filter((topicRecipe) => topicRecipe.id === id && topicRecipe.languageId === languageId && topicRecipe.type === type);

      if (cachedTopicRecipies.length) { return cachedTopicRecipies.values(); }
    }

    try {
      const get = async (results = []) => {
        const response = await this.client.websocket.emit(
          Command.TOPIC_PAGE_RECIPE_LIST,
          {
            body: {
              id,
              languageId,
              maxResults: 50,
              offset: results.length,
              type: type.replace('liveGroupEvent', 'liveEvent').replace('groupEvent', 'event')
            }
          }
        );

        results.push(...response.body);

        return response.body.length < 50
          ? results
          : await get(results);
      };

      for (const topicRecipeResponse of await get()) {
        if (!topicRecipeResponse.success) {
          this.store.delete((topicRecipe) => topicRecipe.id === id && topicRecipe.languageId === languageId && topicRecipe.type === type);
          continue;
        }

        this.store.set(
          new TopicRecipe(this.client, topicRecipeResponse.body, type),
          topicRecipeResponse.headers?.maxAge
        );
      }

      return this.store.filter((topicRecipe) => topicRecipe.id === id && topicRecipe.languageId === languageId && topicRecipe.type === type);
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return []; }
      throw error;
    }
  }
}

export default TopicRecipeHelper;
