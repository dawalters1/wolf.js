import BaseHelper from '../BaseHelper.js';
import ChannelCategory from '../../entities/ChannelCategory.js';
import Language from '../../constants/Language.js';
import { validate } from '../../validation/Validation.js';

export default class ChannelCategorHelper extends BaseHelper {
  async fetch (languageId, opts) {
    const normalisedLanguageId = this.normaliseNumber(languageId);

    validate(normalisedLanguageId, this, this.fetch)
      .isNotNullOrUndefined()
      .in(Object.values(Language));

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    if (!opts?.forceNew) {
      const cached = this.store.filter((item) => item.languageId === normalisedLanguageId);

      if (cached.length > 0) { return cached; }
    }

    this.store.delete((item) => item.languageId === normalisedLanguageId);

    const response = await this.client.websocket.emit(
      'group category list',
      {
        body: {
          languageId: normalisedLanguageId
        }
      }
    );

    const maxAge = response.headers?.maxAge;

    return response.body.map((serverChannelCategory) =>
      this.store.set(
        new ChannelCategory(this.client, serverChannelCategory),
        maxAge
      )
    );
  }
}
