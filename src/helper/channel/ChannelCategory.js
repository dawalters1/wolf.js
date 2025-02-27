'use strict';

// Node dependencies

// 3rd Party Dependencies
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import ChannelCategoryCache from '../../cache/ChannelCategoryCache.js';
import structures from '../../structures/index.js';
// Variables
import { Command, Language } from '../../constants/index.js';

class ChannelCategory extends Base {
  constructor (client) {
    super(client);

    this.channelCategoryCache = new ChannelCategoryCache();
  }

  async get (languageId, forceNew = false) {
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(languageId)) {
        throw new Error(`Achievement.getById() parameter, languageId: ${JSON.stringify(languageId)}, is not a valid number`);
      } else if (Object.values(Language).includes(languageId)) {
        throw new Error(`Achievement.getById() parameter, languageId: ${JSON.stringify(languageId)}, is not a valid languageId`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Achievement.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    if (!forceNew) {
      const cached = this.cache.get(languageId);

      if (cached) { return cached; }
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_CATEGORY_LIST,
      {
        body: {
          languageId
        }
      }
    );

    return this.cache.set(languageId, response.body.map((channelCategory) => new structures.ChannelCategory(this.client, channelCategory)));
  }
}

export default ChannelCategory;
