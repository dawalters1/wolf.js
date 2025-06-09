import BaseHelper from '../baseHelper.ts';
import ChannelCategory, { ServerGroupCategory } from '../../structures/channelCategory';
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

    const response = await this.client.websocket.emit<ServerGroupCategory[]>(
      Command.GROUP_CATEGORY_LIST,
      {
        body: {
          languageId
        }
      }
    );

    return response.body.map((ServerGroupCategory) => {
      const existing = this.cache.get(ServerGroupCategory.id);

      return this.cache.set(
        existing
          ? existing.patch(ServerGroupCategory)
          : new ChannelCategory(this.client, ServerGroupCategory)
      );
    });
  }
}

export default ChannelCategoryHelper;
