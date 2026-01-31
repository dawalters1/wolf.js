
import BaseHelper from '../BaseHelper.js';
import Command from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { StatusCodes } from 'http-status-codes';
import TopicRecipe from '../../entities/TopicRecipe.js';
import { validate } from '../../validation/Validation.js';

class TopicRecipeHelper extends BaseHelper {
  async fetch (recipeId, languageId, type, opts) {
    const normalisedRecipeId = this.normaliseNumber(recipeId);
    const normalisedLanguageId = this.normaliseNumber(languageId);

    validate(normalisedRecipeId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(languageId, this, this.fetch)
      .isNotNullOrUndefined()
      .in(Object.values(Language));

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    if (!opts?.forceNew) {
      const cached = this.store.filter((item) => item.id === normalisedRecipeId && item.languageId === normalisedLanguageId && item.type === type);

      if (cached.length > 0) { return cached; }
    }

    try {
      const batch = async (results = []) => {
        const response = await this.client.websocket.emit(
          'topic page recipe list',
          {
            body: {
              id: normalisedRecipeId,
              languageId: normalisedLanguageId,
              maxResults: 50,
              offset: results.length,
              type: type.replace('liveGroupEvent', 'liveEvent').replace('groupEvent', 'event')
            }
          }
        );

        results.push(...response.body);

        return response.body.length < 50
          ? results
          : await batch(results);
      };

      return (await batch())
        .map((serverTopicRecipe) => {
          serverTopicRecipe.type = type;
          serverTopicRecipe.recipeId = recipeId;

          return this.store.set(new TopicRecipe(this.client, serverTopicRecipe));
        });
    } catch (error) {
      if (error.code !== StatusCodes.NOT_FOUND) { throw error; }
    }

    return this.store.filter((topicRecipe) => topicRecipe.id === normalisedRecipeId && topicRecipe.languageId === normalisedLanguageId && topicRecipe.type === type);
  }
}

export default TopicRecipeHelper;
