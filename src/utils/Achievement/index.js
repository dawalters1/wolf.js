const validator = require('../../validator');
const constants = require('../../constants');

class Achievement {
  constructor (api) {
    this._api = api;
  }

  async mapToCategories (achievements, language) {
    try {
      achievements = Array.isArray(achievements) ? achievements : [achievements];

      if (achievements.length === 0) {
        throw new Error('achievements cannot be an empty array');
      }
      for (const achievement of achievements) {
        if (!Reflect.has(achievement, 'id')) {
          throw new Error('achievement must have property id');
        }

        if (validator.isNullOrUndefined(achievement.id)) {
          throw new Error('id cannot be null or undefined');
        } else if (!validator.isValidNumber(achievement.id)) {
          throw new Error('id must be a valid number');
        } else if (validator.isLessThanOrEqualZero(achievement.id)) {
          throw new Error('id cannot be less than or equal to 0');
        }

        if (Reflect.has(achievement, 'additionalInfo')) {
          const additionalInfo = achievement.additionalInfo;
          if (!Reflect.has(additionalInfo, 'categoryId')) {
            throw new Error('additionalInfo must have property categoryId');
          } else if (validator.isNullOrUndefined(additionalInfo.categoryId)) {
            throw new Error('categoryId cannot be null or undefined');
          } else if (!validator.isValidNumber(additionalInfo.categoryId)) {
            throw new Error('categoryId must be a valid number');
          } else if (validator.isLessThanOrEqualZero(additionalInfo.categoryId)) {
            throw new Error('categoryId cannot be less than or equal to 0');
          }

          if (!Reflect.has(additionalInfo, 'eTag')) {
            throw new Error('additionalInfo must have property eTag');
          } else if (validator.isNullOrWhitespace(additionalInfo.eTag)) {
            throw new Error('eTag cannot be null or empty');
          }
        }

        if (validator.isNullOrUndefined(language)) {
          throw new Error('language cannot be null or undefined');
        } else if (!validator.isValidNumber(language)) {
          throw new Error('language must be a valid number');
        } else if (validator.isLessThanOrEqualZero(language)) {
          throw new Error('language cannot be less than or equal to 0');
        } else if (!Object.values(constants.Language).includes(language)) {
          throw new Error('language is invalid');
        }
      }

      const categories = await this._api.achievement().getCategoryList(language);

      return categories.reduce((result, category) => {
        const achivementForCategory = achievements.filter((achievement) => achievement.additionalInfo.categoryId === category.id);

        result.push(
          {
            id: category.id,
            name: category.name,
            achievements: achivementForCategory
          }
        );

        return result;
      }, []);
    } catch (error) {
      error.internalErrorMessage = `api.utility().achievement().mapToCategories(achievements=${JSON.stringify(achievements)}, language=${JSON.stringify(language)})`;
      throw error;
    }
  }
}

module.exports = Achievement;
