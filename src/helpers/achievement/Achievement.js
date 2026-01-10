import Achievement from '../../entities/Achievement.js';
import AchievementCategoryHelper from './AchievementCategory.js';
import AchievementChannelHelper from './AchievementChannel.js';
import AchievementUserHelper from './AchievementUser.js';
import BaseHelper from '../BaseHelper.js';

export class AchievementHelper extends BaseHelper {
  #category = null;
  #channel = null;
  #user = null;

  constructor (client) {
    super(client);

    this.#category = new AchievementCategoryHelper(client);
    this.#channel = new AchievementChannelHelper(client);
    this.#user = new AchievementUserHelper(client);
  }

  get category () {
    return this.#category;
  }

  get channel () {
    return this.#channel;
  }

  get user () {
    return this.#user;
  }

  async fetch (achievementIds, languageId, opts = {}) {
    const isArrayResponse = Array.isArray(achievementIds);

    const normalisedAchievementIds = this.normaliseNumbers(achievementIds);
    const normalisedLanguageId = this.normaliseNumber(languageId);

    // TODO: validation

    const idsToFetch = opts.forceNew
      ? normalisedAchievementIds
      : normalisedAchievementIds.filter(
        (achievementId) =>
          !this.store.has(
            (item) => item.id === achievementId && item.languageId === normalisedLanguageId
          )
      );

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        'achievement',
        {
          body: {
            idList: idsToFetch,
            languageId: normalisedLanguageId
          }
        }
      );

      const maxAge = response.headers?.maxAge;

      for (const [index, childResponse] of response.body.entries()) {
        const achievementId = idsToFetch[index];

        if (!childResponse.success) {
          this.store.delete(
            (item) => item.id === achievementId && item.languageId === languageId
          );
          continue;
        }

        this.store.set(
          new Achievement(this.client, childResponse.body),
          maxAge
        );
      }
    }

    const achievements = normalisedAchievementIds.map((achievementId) =>
      this.store.get(
        (item) => item.id === achievementId && item.languageId === normalisedLanguageId
      )
    );

    return isArrayResponse
      ? achievements
      : achievements[0];
  }
}
