import Achievement from '../../entities/achievement.js';
import AchievementCategoryHelper from './achievementCategory.js';
import AchievementChannelHelper from './achievementChannel.js';
import AchievementStore from '../../stores/AchievementStore.js';
import AchievementUserHelper from './achievementUser.js';
import BaseHelper from '../baseHelper.js';
import { Command, Language } from '../../constants/index.js';
import { validate } from '../../validator/index.js';

class AchievementHelper extends BaseHelper {
  constructor (client) {
    super(client);

    this.store = new AchievementStore();

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

    const achievementsMap = new Map();

    if (!opts?.forceNew) {
      const cachedAchievementsByLanguage = this.store.get(languageId);

      if (cachedAchievementsByLanguage) {
        achievementIds.map((achievementId) => cachedAchievementsByLanguage.get(achievementId))
          .filter((achievement) => achievement !== null)
          .forEach((achievement) => achievementsMap.set(achievement.id, achievement));
      }
    }

    const idsToFetch = achievementIds.filter((id) => !achievementsMap.has(id));

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
        if (!achievementResponse.success) {
          this.store.invalidate(languageId, idsToFetch[index]);
          continue;
        }

        achievementsMap.set(
          idsToFetch[index],
          this.store.set(languageId, new Achievement(this.client, achievementResponse), response.headers?.maxAge)
        );
      }
    }

    return achievementIds.map((achievementId) => achievementsMap.get(achievementId) ?? null);
  }
}

export default AchievementHelper;
