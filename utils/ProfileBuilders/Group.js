const validator = require('@dawalters1/validator');
const constants = require('@dawalters1/constants');
const request = require('../../constants/request');

module.exports = class Group {
  constructor (bot) {
    this._bot = bot;

    this._id = 0;
    this._name = undefined;
    this._tagLine = undefined;
    this._description = undefined;
    this._peekable = false;
    this._discoverable = true;
    this._advancedAdmin = false;
    this._entryLevel = 0;
    this._language = constants.language.NOT_SPECIFIED;
    this._category = constants.category.NOT_SPECIFIED;
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
    } else if (!Object.values(constants.category).includes(category)) {
      throw new Error('category is not valid');
    }

    this._category = category;

    return this;
  }

  setLanguage (language) {
    if (!validator.isValidNumber(language)) {
      throw new Error('language must be a number');
    } else if (!Object.values(constants.language).includes(language)) {
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

  async create () {
    return await (!this.isNew ? this.save() : this._doCorrectAction(request.GROUP_CREATE));
  }

  async save () {
    return await (this.isNew ? this.create() : this._doCorrectAction(request.GROUP_PROFILE_UPDATE));
  }

  async _doCorrectAction (command) {
    return await this._bot.websocket.emit(command,
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
      });
  }
};
