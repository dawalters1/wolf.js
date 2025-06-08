import BaseHelper from '../baseHelper.ts';
import ChannelCategory, { ServerChannelCategory } from '../../structures/channelCategory';
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

    const response = await this.client.websocket.emit<ServerChannelCategory[]>(
      Command.GROUP_CATEGORY_LIST,
      {
        body: {
          languageId
        }
      }
    );

    return response.body.map((serverChannelCategory) => {
      const existing = this.cache.get(serverChannelCategory.id);

      return this.cache.set(
        existing
          ? existing.patch(serverChannelCategory)
          : new ChannelCategory(this.client, serverChannelCategory)
      );
    });
  }
}

export default ChannelCategoryHelper;
