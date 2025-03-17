import Base from './Base.js';

class Achievement extends Base {
  constructor (client, data, languageId) {
    super(client);

    this.acquisitionPercentage = data?.acquisitionPercentage;
    this.category = data?.category;
    this.description = data?.description
      ? new Map().set(languageId, data.description)
      : undefined;
    this.id = data?.id;
    this.imageUrl = data?.imageUrl;
    this.levelId = data?.levelId;
    this.levelName = data?.levelName
      ? new Map().set(languageId, data.levelName)
      : undefined;
    this.name = data?.name
      ? new Map().set(languageId, data.name)
      : undefined;
    this.parentId = data?.parentId;
    this.typeId = data?.typeId;
  }

  _hasLanguage (languageId) {
    return this.description.has(languageId) &&
    this.levelName.has(languageId) &&
    this.name.has(languageId);
  }

  _patch (data, languageId) {
    this.description.set(languageId, data.description.get(languageId));
    this.levelName.set(languageId, data.levelName.get(languageId));
    this.name.set(languageId, data.name.get(languageId));
  }
}

export default Achievement;
