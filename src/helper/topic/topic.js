import BaseHelper from '../baseHelper.js';
import Command from '../../constants/Command.js';
import Language from '../../constants/Language.js';
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
        .isNotNullOrUndefined(`ChannelHelper.search() parameter, name: ${name} is null or undefined`)
        .isNotEmptyOrWhitespace(`ChannelHelper.search() parameter, name: ${name} is empty or whitespace`);

      validate(languageId)
        .isNotNullOrUndefined(`RoleHelper.getById() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `RoleHelper.getById() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'EventHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    if (!opts?.forceNew) {
      const cached = this.cache.get(name);

      if (cached && cached.hasLanguage(languageId)) {
        return this.cache.get(name);
      }

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
    }
  }
}

export default TopicHelper;
