import BaseHelper from '../baseHelper.js';
import Command from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { StatusCodes } from 'http-status-codes';
import TopicPage from '../../entities/topicPage.js';
import TopicRecipeHelper from './topicRecipe.js';
import { validate } from '../../validator/index.js';

class TopicHelper extends BaseHelper {
  constructor (client) {
    super(client, 300);

    this.recipe = new TopicRecipeHelper(client);
  }

  async get (name, languageId, opts) {
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      validate(name)
        .isNotNullOrUndefined(`TopicHelper.get() parameter, name: ${name} is null or undefined`)
        .isNotEmptyOrWhitespace(`TopicHelper.get() parameter, name: ${name} is empty or whitespace`);

      validate(languageId)
        .isNotNullOrUndefined(`TopicHelper.get() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `TopicHelper.get() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'TopicHelper.get() parameter, opts.{parameter}: {value} {error}');
    }

    if (!opts?.forceNew) {
      const cached = this.cache.get(name, languageId);

      if (cached) {
        return cached;
      }

      try {
        const response = await this.client.websocket.emit(
          Command.TOPIC_PAGE_LAYOUT,
          {
            body: {
              name,
              languageId
            }
          }
        );

        return this.cache.set(
          this.cache.get(name)?.patch(response.body) ??
        new TopicPage(this.client, response.body)
        );
      } catch (error) {
        if (error.code === StatusCodes.NOT_FOUND) { return null; };
        throw error;
      }
    }
  }
}

export default TopicHelper;
