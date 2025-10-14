import Achievement from '../../entities/achievement.js';
import AchievementCategoryHelper from './achievementCategory.js';
import AchievementChannelHelper from './achievementChannel.js';
import AchievementUserHelper from './achievementUser.js';
import BaseHelper from '../baseHelper.js';
import { Command, Language } from '../../constants/index.js';
import { validate } from '../../validator/index.js';

class AchievementHelper extends BaseHelper {
  constructor (client) {
    super(client);

    this.category = new AchievementCategoryHelper(client);
    this.channel = new AchievementChannelHelper(client);
    this.user = new AchievementUserHelper(client);
  }

  async getById (achievementId, languageId, opts) {
    achievementId = Number(achievementId) || achievementId;
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      validate(achievementId)
        .isNotNullOrUndefined(`AchievementHelper.getById() parameter, achievementId: ${achievementId} is null or undefined`)
        .isValidNumber(`AchievementHelper.getById() parameter, achievementId: ${achievementId} is not a valid number`)
        .isGreaterThan(0, `AchievementHelper.getById() parameter, achievementId: ${achievementId} is less than or equal to zero`);

      validate(languageId)
        .isNotNullOrUndefined(`AchievementHelper.getById() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `AchievementHelper.getById() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AchievementHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([achievementId], languageId, opts))[0];
  }

  async getByIds (achievementIds, languageId, opts) {
    achievementIds = achievementIds.map((achievementId) => Number(achievementId) || achievementId);
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      validate(achievementIds)
        .isArray(`AchievementHelper.getByIds() parameter, achievementIds: ${achievementIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('AchievementHelper.getByIds() parameter, achievementId[{index}]: {value} is null or undefined')
        .isValidNumber('AchievementHelper.getByIds() parameter, achievementId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'AchievementHelper.getByIds() parameter, achievementId[{index}]: {value} is less than or equal to zero');

      validate(languageId)
        .isNotNullOrUndefined(`AchievementHelper.getByIds() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `AchievementHelper.getByIds() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'AchievementHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }

    const idsToFetch = opts?.forceNew
      ? achievementIds
      : achievementIds.filter((achievementId) => !this.store.has((achievement) => achievement.id === achievementId && achievement.languageId === languageId));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.ACHIEVEMENT,
        {
          body: {
            idList: idsToFetch,
            languageId
          }
        }
      );

      for (const [index, achievementResponse] of response.body.entries()) {
        const achievementId = idsToFetch[index];

        if (!achievementResponse.success) {
          this.store.delete((achievement) => achievement.id === achievementId && achievement.languageId === languageId);
          continue;
        }

        this.store.set(
          new Achievement(this.client, achievementResponse),
          response.headers?.maxAge
        );
      }
    }

    return achievementIds.map((achievementId) =>
      this.store.get((achievement) => achievement.id === achievementId && achievement.languageId === languageId)
    );
  }
}

export default AchievementHelper;
