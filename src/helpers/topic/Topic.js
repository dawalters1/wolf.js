import BaseHelper from '../BaseHelper.js';
import { StatusCodes } from 'http-status-codes';
import TopicPage from '../../entities/TopicPage.js';
import TopicRecipeHelper from './TopicRecipe.js';

export default class TopicHelper extends BaseHelper {
  #recipe;

  constructor (client) {
    super(client);
    this.#recipe = new TopicRecipeHelper(client);
  }

  get recipe () {
    return this.#recipe;
  }

  async fetch (name, languageId, opts) {
    const normalisedLanguageId = this.normaliseNumber(languageId);

    if (!opts?.forceNew) {
      const cached = this.store.get((item) => this.client.utility.string.isEqual(item.name, name) && item.languageId === languageId);

      if (cached) { return cached; }
    }

    try {
      const response = await this.client.websocket.emit(
        'topic page layout',
        {
          name,
          languageId: normalisedLanguageId
        }
      );

      return this.store.set(
        new Topic(this.client, response.body),
        response.headers?.maxAge
      );
    } catch (error) {
      if (error.code !== StatusCodes.NOT_FOUND) { throw error; };

      return null;
    }
  }
}
