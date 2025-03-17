'use strict';

// Node dependencies

// 3rd Party Dependencies
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import DataManager from '../../manager/DataManager.js';
import AchievementCategory from './AchievementCategory.js';
import AchievementChannel from './AchievementChannel.js';
import AchievementUser from './AchievementUser.js';
import structures from '../../structures/index.js';
// Variables
import { Command, Language } from '../../constants/index.js';

class Achievement extends Base {
  constructor (client) {
    super(client);

    this._achievements = new DataManager('id', 600);

    this.user = new AchievementUser();
    this.channel = new AchievementChannel();
    this.category = new AchievementCategory();
  }

  async getById (languageId, achievementId, forceNew = false) {
    // Parsing - Convert everything into numbers
    languageId = Number(languageId) || languageId;
    achievementId = Number(achievementId) || achievementId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(achievementId)) {
        throw new Error(`Achievement.getById() parameter, achievementId: ${JSON.stringify(achievementId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(achievementId)) {
        throw new Error(`Achievement.getById() parameter, achievementId: ${JSON.stringify(achievementId)}, is zero or negative`);
      }

      if (!verify.isValidNumber(languageId)) {
        throw new Error(`Achievement.getById() parameter, languageId: ${JSON.stringify(languageId)}, is not a valid number`);
      } else if (Object.values(Language).includes(languageId)) {
        throw new Error(`Achievement.getById() parameter, languageId: ${JSON.stringify(languageId)}, is not a valid languageId`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Achievement.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }
  }

  async getByIds (languageId, achievementIds, forceNew = false) {
    languageId = parseInt(languageId);
    achievementIds = (Array.isArray(achievementIds) ? achievementIds : [achievementIds]).map((id) => Number(id) || id);

    { // eslint-disable-line no-lone-blocks
      if (!achievementIds.length) {
        throw new Error(`Achievement.getByIds() parameter, achievementIds: ${JSON.stringify(achievementIds)}, cannot be an empty array`);
      } else if ([...new Set(achievementIds)].length !== achievementIds.length) {
        throw new Error(`Achievement.getByIds() parameter, achievementIds: ${JSON.stringify(achievementIds)}, cannot contain duplicate ids`);
      } else {
        achievementIds.forEach((achievementId, index) => {
          if (!verify.isValidNumber(achievementId)) {
            throw new Error(`Achievement.getByIds() parameter, achievementIds[${index}]: ${JSON.stringify(achievementId)}, is not a valid number`);
          } else if (verify.isLessThanOrEqualZero(achievementId)) {
            throw new Error(`Achievement.getByIds() parameter, achievementIds[${index}]: ${JSON.stringify(achievementId)}, is zero or negative`);
          }
        });
      }

      if (!verify.isValidNumber(languageId)) {
        throw new Error(`Achievement.getByIds() parameter, languageId: ${JSON.stringify(languageId)}, is not a valid number`);
      } else if (Object.values(Language).includes(languageId)) {
        throw new Error(`Achievement.getByIds() parameter, languageId: ${JSON.stringify(languageId)}, is not a valid languageId`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Achievement.getByIds() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    const achievements = forceNew
      ? []
      : achievementIds.map((achievementId) => this._achievements.get(achievementId))
        .filter((achievement) => achievement?._hasLanguage(languageId));

    if (achievements.length === achievementIds.length) { return achievements; }

    const idList = achievementIds.filter((id) => !achievements.some((achievement) => achievement.id === id));

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT,
      {
        headers: {
          version: 2
        },
        body: {
          idList,
          languageId
        }
      }
    );

    response.body.forEach((subResponse, index) =>
      achievements.push(
        subResponse.success
          ? this._achievements._add(new structures.Achievement(this.client, subResponse.body), languageId)
          : new structures.Achievement(this.client, { id: idList[index] })
      )
    );

    // Sort to match ids order
    return achievementIds
      .map((id) =>
        achievements.find((achievement) => achievement.id === id)
      );
  }
}

export default Achievement;
