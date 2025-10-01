import BaseHelper from '../baseHelper.js';
import ChannelCategory from '../../entities/channelCategory.js';
import ChannelCategoryStore from '../../stores_old/ChannelCategoryStore.js';
import { Command } from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { validate } from '../../validator/index.js';

class ChannelCategoryHelper extends BaseHelper {
  constructor (client) {
    super(client, ChannelCategoryStore);
  }

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
      const cachedCategories = this.store.get(languageId);

      if (cachedCategories) {
        return cachedCategories.values();
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

    return this.store.set(
      languageId,
      response.body.map((serverChannelCategory) =>
        new ChannelCategory(this.client, serverChannelCategory)
      ),
      response.headers?.maxAge
    );
  }
}

export default ChannelCategoryHelper;
