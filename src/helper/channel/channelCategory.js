import BaseHelper from '../baseHelper.js';
import ChannelCategory from '../../entities/channelCategory.js';
import { Command } from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { validate } from '../../validator/index.js';

class ChannelCategoryHelper extends BaseHelper {
  async list (languageId, opts) {
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      validate(languageId)
        .isNotNullOrUndefined(`ChannelCategoryHelper.list() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `ChannelCategoryHelper.list() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'ChannelCategoryHelper.list() parameter, opts.{parameter}: {value} {error}');
    }
    if (!opts?.forceNew) {
      const cachedCategories = this.cache.values().filter((category) => category.languageId === languageId);

      if (cachedCategories.length) {
        return cachedCategories;
      }
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_CATEGORY_LIST,
      {
        body: {
          languageId
        }
      }
    );

    return response.body.map(serverCategory => {
      const existing = this.cache.get(serverCategory.id, languageId);

      return this.cache.set(
        existing
          ? existing.patch(serverCategory)
          : new ChannelCategory(this.client, serverCategory)
      );
    });
  }
}

export default ChannelCategoryHelper;
