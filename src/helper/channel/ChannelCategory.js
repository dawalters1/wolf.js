'use strict';

// Node dependencies

// 3rd Party Dependencies
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import DataManager from '../../manager/DataManager.js';
import structures from '../../structures/index.js';
// Variables
import { Command, Language } from '../../constants/index.js';

class ChannelCategory extends Base {
  constructor (client) {
    super(client);

    this._channelCategories = new DataManager();
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
      const cached = this._channelCategories.cache.values();

      if (cached && cached.every((category) => category._hasLanguage(languageId))) {
        return cached;
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

    return response.body.map((channelCategory) =>
      this._channelCategories._add(new structures.ChannelCategory(this.client, channelCategory), languageId)
    );
  }
}

export default ChannelCategory;
