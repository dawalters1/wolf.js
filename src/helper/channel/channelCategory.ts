import BaseHelper from '../baseHelper.ts';
import ChannelCategory from '../../structures/achievementCategory.ts';
import { ChannelCategoryOptions } from '../../options/requestOptions.ts';
import { Command } from '../../constants/Command.ts';
import { Language } from '../../constants/Language.ts';

class ChannelCategoryHelper extends BaseHelper<ChannelCategory> {
  async list (languageId: Language, opts?: ChannelCategoryOptions): Promise<ChannelCategory[]> {
    if (!opts?.forceNew) {
      const cachedChannelCategories = this.cache.values();

      if (cachedChannelCategories && cachedChannelCategories.every((channelCategory) => channelCategory.hasLanguage(languageId))) {
        return cachedChannelCategories;
      }
    }

    const response = await this.client.websocket.emit<ChannelCategory[]>(
      Command.GROUP_CATEGORY_LIST,
      {
        body: {
          languageId
        }
      }
    );

    return this.cache.setAll(response.body);
  }
}

export default ChannelCategoryHelper;
