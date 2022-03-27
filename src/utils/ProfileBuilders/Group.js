const validator = require('../../validator');
const { Commands, Language, Category } = require('../../constants');

/**
 * Exposes the methods used to update or create group profiles
 * {@hideconstructor}
 */
module.exports = class GroupProfileBuilder {
  constructor (api) {
    this._api = api;

    this._id = 0;
    this._name = undefined;
    this._tagLine = undefined;
    this._description = undefined;
    this._peekable = false;
    this._discoverable = true;
    this._advancedAdmin = false;
    this._entryLevel = 0;
    this._language = Language.NOT_SPECIFIED;
    this._category = Category.NOT_SPECIFIED;

    this._audioConfig = {
      minRepLevel: 0,
      enabled: false,
      stageId: null
    };
  }

  _create () {
    this._isNew = true;

    return this;
  }

  _update (group) {
    this._id = group.id;
    this._name = group.name;
    this._tagLine = group.description;
    this._description = group.extended.longDescription;
    this._peekable = group.extended.peekable;
    this._discoverable = group.extended.discoverable;
    this._advancedAdmin = group.extended.advancedAdmin;
    this._entryLevel = group.extended.entryLevel;
    this._language = group.extended.language;
    this._category = group.extended.category;
    this._audioConfig = group.audioConfig;

    this._isNew = false;

    return this;
  }

  setName (name) {
    if (!this._isNew) {
      throw new Error('Cannot update existing group name');
    }

    if (validator.isNullOrWhitespace(name)) {
      throw new Error('name cannot be null or empty');
    }

    this._name = name;

    return this;
  }

  setTagLine (tagLine) {
    this._tagLine = tagLine;

    return this;
  }

  setDescription (description) {
    this._description = description;

    return this;
  }

  setCategory (category) {
    if (!validator.isValidNumber(category)) {
      throw new Error('category must be a number');
    } else if (!Object.values(Category).includes(category)) {
      throw new Error('category is not valid');
    }

    this._category = category;

    return this;
  }

  setLanguage (language) {
    if (!validator.isValidNumber(language)) {
      throw new Error('language must be a number');
    } else if (!Object.values(Language).includes(language)) {
      throw new Error('language is not valid');
    }

    this._language = language;

    return this;
  }

  setEntryLevel (entryLevel) {
    if (!validator.isValidNumber(entryLevel)) {
      throw new Error('entryLevel must be a number');
    } else if (validator.isLessThanZero(entryLevel)) {
      throw new Error('entryLevel must be greater than or equal to zero');
    }

    this._entryLevel = entryLevel;

    return this;
  }

  setAdvancedAdmin (isEnabled) {
    if (!validator.isValidBoolean(isEnabled)) {
      throw new Error('isEnabled is not a valid boolean');
    }

    this._advancedAdmin = isEnabled;

    return this;
  }

  setDiscoverable (isEnabled) {
    if (!validator.isValidBoolean(isEnabled)) {
      throw new Error('isEnabled is not a valid boolean');
    }

    this._discoverable = isEnabled;

    return this;
  }

  setConversationPreview (isEnabled) {
    if (!validator.isValidBoolean(isEnabled)) {
      throw new Error('isEnabled is not a valid boolean');
    }

    this._peekable = isEnabled;

    return this;
  }

  setStageId (stageId) {
    if (!validator.isValidNumber(stageId)) {
      throw new Error('stageId must be a number');
    } else if (validator.isLessThanZero(stageId)) {
      throw new Error('stageId must be greater than zero');
    }

    // StageId 0 = Basic/No Theme
    this._audioConfig.stageId = stageId === 0 ? null : stageId;

    return this;
  }

  setStageState (isEnabled) {
    if (!validator.isValidBoolean(isEnabled)) {
      throw new Error('isEnabled is not a valid boolean');
    }

    this._audioConfig.enabled = isEnabled;

    return this;
  }

  setStageLevel (level) {
    if (!validator.isValidNumber(level)) {
      throw new Error('level must be a number');
    } else if (validator.isLessThanZero(level)) {
      throw new Error('level must be greater than zero');
    }

    this._audioConfig.minRepLevel = level;

    return this;
  }

  async create () {
    return await (!this._isNew ? this.save() : this._doCorrectAction(Commands.GROUP_CREATE));
  }

  async save () {
    return await (this._isNew ? this.create() : this._doCorrectAction(Commands.GROUP_PROFILE_UPDATE));
  }

  async _doCorrectAction (command) {
    const result = await this._api.websocket.emit(
      command,
      {
        id: this._id,
        name: this._name,
        extended:
        {
          language: this._language,
          advancedAdmin: this._advancedAdmin,
          longDescription: this._description,
          category: this._category,
          entryLevel: this._entryLevel,
          discoverable: this._discoverable
        },
        description: this._tagLine,
        peekable: this._peekable
      }
    );

    if (result.success) {
      this._audioConfig.id = (await this._api.group().getByName(this._name)).id;

      await this._api.websocket.emit(
        Commands.GROUP_AUDIO_UPDATE,
        this._audioConfig
      );
    }

    return result;
  }
};
