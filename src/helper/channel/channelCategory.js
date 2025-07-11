import BaseHelper from '../baseHelper.js';
import ChannelCategory from '../../entities/channelCategory.js';
import { Command } from '../../constants/Command.js';

class ChannelCategoryHelper extends BaseHelper {
  async list (languageId, opts) {
    if (!opts?.forceNew) {
      const cachedCategories = [...this.cache.values()];

      if (cachedCategories.length && cachedCategories.every(cat => cat.hasLanguage(languageId))) {
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
      const existing = this.cache.get(serverCategory.id);

      return this.cache.set(
        existing
          ? existing.patch(serverCategory)
          : new ChannelCategory(this.client, serverCategory)
      );
    });
  }
}

export default ChannelCategoryHelper;
