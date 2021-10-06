const validator = require('../validator');
const constants = require('@dawalters1/constants');

class Achievement {
  constructor (api) {
    this._api = api;
  }

  async mapToCategories (achievements, language) {
    if (!validator.isValidArray(achievements)) {
      throw new Error('achievements must be an array');
    } else if (achievements.length === 0) {
      throw new Error('achievements cannot be an empty array');
    }

    for (const achievement of achievements) {
      if (achievement.id) {
        if (!validator.isValidNumber(achievement.id)) {
          throw new Error('id must be a valid number');
        } else if (validator.isLessThanOrEqualZero(achievement.id)) {
          throw new Error('id cannot be less than or equal to 0');
        }
      } else {
        throw new Error('achivement must contain id');
      }

      if (achievement.additionalInfo) {
        const additionalInfo = achievement.additionalInfo;

        if (!validator.isValidNumber(additionalInfo.categoryId)) {
          throw new Error('categoryId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(additionalInfo.categoryId)) {
          throw new Error('categoryId cannot be less than or equal to 0');
        }

        if (validator.isNullOrWhitespace(additionalInfo.eTag)) {
          throw new Error('eTag cannot be null or empty');
        }
      }

      if (!validator.isValidNumber(language)) {
        throw new Error('language must be a valid number');
      } else if (!Object.values(constants.language).includes(language)) {
        throw new Error('language is invalid');
      }
    }

    const categories = await this._api.achievement().getCategoryList(language);

    return categories.reduce((result, category) => {
      const achivementForCategory = achievements.filter((achievement) => achievement.additionalInfo.categoryId === category.id);

      result.push({
        id: category.id,
        name: category.name,
        achievements: achivementForCategory
      });

      return result;
    }, []);
  }
}

module.exports = Achievement;
