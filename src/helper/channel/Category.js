import Base from '../Base.js';
import models from '../../models/index.js';
import Constants, { Language } from '../../constants/index.js';
import validator from '../../validator/index.js';

const { Command } = Constants;

class Category extends Base {
  constructor (client) {
    super(client);

    this.categories = {};
  }

  async list (languageId, forceNew = false) {
    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new models.WOLFAPIError('languageId is not valid', { languageId });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    if (!forceNew && this.categories[languageId]) {
      return this.categories[languageId];
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_CATEGORY_LIST,
      {
        languageId: parseInt(languageId)
      }
    );

    return this._process(response.body?.map((category) => new models.ChannelCategory(this.client, category)) ?? undefined, languageId);
  }

  _process (categories, language) {
    this.categories[language] = categories;

    return categories;
  }

  _cleanUp (reconnection = false) {
    if (reconnection) { return false; }

    this.categories = {};
  }
}

export default Category;
