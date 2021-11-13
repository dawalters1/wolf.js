const validator = require('../../validator');
const constants = require('../../constants');
const { commands } = require('../../constants');
/**
 * Exposes the methods used to update the bots profiles
 * {@hideconstructor}
 */
module.exports = class SubscriberProfileBuilder {
  constructor (api, subscriber) {
    this._api = api;

    if (!subscriber) {
      throw new Error('You must be logged in to update a profile');
    }

    this._id = subscriber.id;
    this._nickname = subscriber.nickname;
    this._status = subscriber.status;
    this._language = subscriber.extended.language;
    this._relationship = subscriber.extended.relationship;
    this._urls = subscriber.extended.urls || [];
    this._gender = subscriber.extended.gender;
    this._lookingFor = subscriber.extended.lookingFor;
    this._about = subscriber.extended.about;
    this._name = subscriber.extended.name;
  }

  setNickname (nickname) {
    if (validator.isNullOrWhitespace(nickname)) {
      throw new Error('name cannot be null or empty');
    }

    this._nickname = nickname;

    return this;
  }

  setAbout (about) {
    this._about = about;

    return this;
  }

  setName (name) {
    this._name = name;

    return this;
  }

  setStatus (status) {
    this._status = status;

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

  setRelationship (relationship) {
    if (!validator.isValidNumber(relationship)) {
      throw new Error('relationship must be a number');
    } else if (!Object.values(constants.relationship).includes(relationship)) {
      throw new Error('relationship is not valid');
    }

    this._relationship = relationship;

    return this;
  }

  setGender (gender) {
    if (!validator.isValidNumber(gender)) {
      throw new Error('gender must be a number');
    } else if (!Object.values(constants.gender).includes(gender)) {
      throw new Error('gender is not valid');
    }

    this._gender = gender;

    return this;
  }

  setLookingFor (lookingFor) {
    if (!validator.isValidNumber(lookingFor)) {
      throw new Error('lookingFor must be a number');
    } else if (!Object.values(constants.lookingFor).includes(lookingFor)) {
      throw new Error('lookingFor is not valid');
    }

    this._lookingFor = Object.values(constants.lookingFor).filter((look) => (lookingFor & look) === look).reduce((total, val) => total + (+val), 0);

    return this;
  }

  setUrls (urls) {
    urls = Array.isArray(urls) ? urls : [urls];

    this._urls = urls;

    return this;
  }

  addUrl (url) {
    if (validator.isNullOrWhitespace(url)) {
      throw new Error('url cannot be null or empty');
    }

    this._urls.push(url);

    return this;
  }

  removeUrl (url) {
    if (validator.isNullOrWhitespace(url)) {
      throw new Error('url cannot be null or empty');
    }

    this._urls = this._urls.filter((_url) => !this._api.utility().string().isEqual(_url, url));

    return this;
  }

  clearUrls () {
    this._urls = [];

    return this;
  }

  async save () {
    return await this._api.websocket.emit(
      commands.SUBSCRIBER_PROFILE_UPDATE,
      {
        id: this._id,
        extended:
        {
          about: this._about,
          gender: this._gender,
          language: this._language,
          lookingFor: this._lookingFor,
          name: this._name,
          relationship: this._relationship,
          urls: this._urls
        },
        nickname: this._nickname,
        status: this._status
      });
  }
};
