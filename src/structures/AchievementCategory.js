import Base from './Base.js';

class AchievementCategory extends Base {
  constructor (client, data, languageId) {
    super(client);

    this.id = data?.id;
    this.name = data?.name
      ? new Map().set(languageId, data.name)
      : undefined;
  }

  _hasLanguage (languageId) {
    return this.name.has(languageId);
  }

  _patch (achievementCategory, languageId) {
    this.name.set(languageId, achievementCategory.get(languageId));
  }
}

export default AchievementCategory;
