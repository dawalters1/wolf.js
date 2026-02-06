import BaseHelper from '../BaseHelper.js';
import Language from '../../constants/Language.js';
import { validate } from '../../validation/Validation.js';

export default class DiscoveryHelper extends BaseHelper {
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

    return await this.client.topic.fetch('discover', languageId, opts);
  }
}
