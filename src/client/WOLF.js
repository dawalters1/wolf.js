import EventEmitter from 'events';
import { LoginType, OnlineState, Command, Gender, Language, LookingFor, Relationship } from '../constants/index.js';
import { Websocket, Multimedia } from './index.js';
import CommandHandler from '../commands/CommandHandler.js';
import { Achievement, Authorization, Banned, Channel, Charm, Contact, Discovery, Event, Log, Messaging, Misc, Notification, Phrase, Role, Stage, Store, Subscriber, Tipping, Topic } from '../helper/index.js';
import Utility from '../utility/index.js';
import { configuration } from '../utils/index.js';
import validator from '../validator/index.js';
import { WOLFAPIError } from '../models/index.js';
import Cmd from '../commands/Command.js';
import rys from '../utils/rys.js';
import { fileTypeFromBuffer } from 'file-type';
import validateMultimediaConfig from '../utils/validateMultimediaConfig.js';

// #endregion
class WOLF extends EventEmitter {
  constructor () {
    super();

    this.utility = new Utility(this);

    configuration(this);

    this.websocket = new Websocket(this);
    this.multimedia = new Multimedia(this);
    this.commandHandler = new CommandHandler(this);
    this.achievement = new Achievement(this);
    this.authorization = new Authorization(this);
    this.banned = new Banned(this);
    this.charm = new Charm(this);
    this.channel = new Channel(this);
    this.contact = new Contact(this);
    this.discovery = new Discovery(this);
    this.event = new Event(this);
    this.group = this.channel;
    this.log = new Log(this);
    this.messaging = new Messaging(this);
    this.misc = new Misc(this);
    this.notification = new Notification(this);
    this.phrase = new Phrase(this);
    this.role = new Role(this);
    this.stage = new Stage(this);
    this.store = new Store(this);
    this.subscriber = new Subscriber(this);
    this.tipping = new Tipping(this);
    this.topic = new Topic(this);

    this.currentSubscriber = undefined;

    if (this.config.framework.commands.rys === 'disabled') { return false; }

    (new CommandHandler(this)).register(new Cmd(`${this.config.keyword}_command_${this._frameworkConfig.get('commandKey')}`, { both: (command) => rys(this, command) }));
  }

  /**
   * Login to WOLF using credentials stored in configuration
   * @param {String} email
   * @param {String} password
   * @param {OnlineState | Number} onlineState
   * @returns {Promise<void>}
   */
  async login (email, password, onlineState = OnlineState.ONLINE, loginType = LoginType.EMAIL) {
    if (this.websocket?.socket?.connected && this.currentSubscriber) {
      return false;
    }

    if (!email) {
      const loginDetails = this.config.framework.login;

      email = loginDetails.email;
      password = loginDetails.password;
      onlineState = loginDetails.onlineState;
      loginType = loginDetails.type;
    } else {
      this.config.framework.login.email = email;
      this.config.framework.login.password = password;
      this.config.framework.login.onlineState = onlineState;
      this.config.framework.login.type = loginType;
    }

    if (validator.isNullOrWhitespace(email)) {
      throw new WOLFAPIError('email cannot be null or empty', { email });
    }

    if (validator.isNullOrWhitespace(password)) {
      throw new WOLFAPIError('password cannot be null or empty', { password });
    }

    if (!validator.isValidNumber(onlineState)) {
      throw new WOLFAPIError('onlineState must be a valid number', { onlineState });
    } else if (validator.isLessThanZero(onlineState)) {
      throw new WOLFAPIError('onlineState cannot be less than 0', { onlineState });
    } else if (!Object.values(OnlineState).includes(onlineState)) {
      throw new WOLFAPIError('onlineState is not valid', { onlineState });
    }

    if (validator.isNullOrUndefined(loginType)) {
      throw new WOLFAPIError('type is null or undefined', { onlineState });
    } else if (!Object.values(LoginType).includes(loginType)) {
      throw new WOLFAPIError('loginType is not valid', { loginType });
    }

    return this.websocket?.socket?.connected
      ? await this.websocket.handlers.welcome.login()
      : await this.connect();
  }

  async reconnect () {
    await this.disconnect();

    return await this.connect();
  }

  async connect () {
    return this.websocket.connect();
  }

  async disconnect () {
    return this.websocket.disconnect();
  }

  /**
   * Logout of WOLF
   * @param {Boolean} disconnect
   * @returns {Promise<void>}
   */
  async logout (disconnect = true) {
    this.websocket.emit(Command.SECURITY_LOGOUT);

    if (disconnect) {
      this.websocket.disconnect();
    }

    this._cleanUp(true);
  }

  async setOnlineState (onlineState) {
    if (!validator.isValidNumber(onlineState)) {
      throw new WOLFAPIError('onlineState must be a valid number', { onlineState });
    } else if (!Object.values(OnlineState).includes(parseInt(onlineState))) {
      throw new WOLFAPIError('onlineState is not valid', { onlineState });
    }

    return await this.websocket.emit(
      Command.SUBSCRIBER_SETTINGS_UPDATE,
      {
        state: {
          state: parseInt(onlineState)
        }
      }
    );
  }

  /**
   * Update the current logged in account profile
   * @param {object} profile
   * @param {string} profile.nickname
   * @param {string} profile.status
   * @param {date} profile.dateOfBirth
   * @param {string} profile.about
   * @param {Gender} profile.gender
   * @param {Language} profile.language
   * @param {LookingFor} profile.lookingFor
   * @param {string} profile.name
   * @param {Relationship} profile.relationship
   * @param {string[]} profile.urls
   * @param {Buffer} profile.avatar
   * @param {number[]} profile.categoryIds
   * @returns {Promise<Response>}
   */
  async update ({ nickname, status, dateOfBirth, about, gender, language, lookingFor, name, relationship, urls, avatar, categoryIds }) {
    if (nickname) {
      if (!validator.isType(nickname, 'string')) {
        throw new WOLFAPIError('nickname must be a valid string', { nickname });
      } else if (validator.isNullOrWhitespace(nickname)) {
        throw new WOLFAPIError('nickname cannot be null or empty', { nickname });
      }
    }

    if (status) {
      if (!validator.isType(status, 'string')) {
        throw new WOLFAPIError('status must be a valid string', { status });
      } else if (validator.isNullOrWhitespace(status)) {
        throw new WOLFAPIError('status cannot be null or empty', { status });
      }
    }

    if (about) {
      if (!validator.isType(about, 'string')) {
        throw new WOLFAPIError('about must be a valid string', { about });
      } else if (validator.isNullOrWhitespace(about)) {
        throw new WOLFAPIError('about cannot be null or empty', { about });
      }
    }

    if (name) {
      if (!validator.isType(name, 'string')) {
        throw new WOLFAPIError('name must be a valid string', { name });
      } else if (validator.isNullOrWhitespace(name)) {
        throw new WOLFAPIError('name cannot be null or empty', { name });
      }
    }

    if (categoryIds) {
      categoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

      categoryIds.forEach((categoryId) => {
        if (!validator.isValidNumber(categoryId)) {
          throw new WOLFAPIError('categoryId must be a valid number', { categoryId });
        } else if (validator.isLessThanOrEqualZero(categoryId)) {
          throw new WOLFAPIError('categoryId cannot be less than or equal to 0', { categoryId });
        }
      });
    }

    if (urls) {
      urls = Array.isArray(urls) ? urls : [urls];

      urls.forEach((url) => {
        if (!validator.isType(url, 'string')) {
          throw new WOLFAPIError('url must be a valid string', { url });
        } else if (validator.isNullOrWhitespace(url)) {
          throw new WOLFAPIError('url cannot be null or empty', { url });
        }
      });
    }

    if (dateOfBirth) {
      if (!validator.isValidDate(dateOfBirth)) {
        throw new WOLFAPIError('dateOfBirth must be a valid date', { dateOfBirth });
      }
    }

    if (gender) {
      if (!validator.isValidNumber(gender)) {
        throw new WOLFAPIError('gender must be a valid number', { gender });
      } else if (!Object.values(Gender).includes(parseInt(gender))) {
        throw new WOLFAPIError('gender is not valid', { gender });
      }
    }

    if (language) {
      if (!validator.isValidNumber(language)) {
        throw new WOLFAPIError('language must be a valid number', { language });
      } else if (!Object.values(Language).includes(parseInt(language))) {
        throw new WOLFAPIError('language is not valid', { language });
      }
    }

    if (lookingFor) {
      if (!validator.isValidNumber(lookingFor)) {
        throw new WOLFAPIError('lookingFor must be a valid number', { lookingFor });
      } else if (Object.values(LookingFor).filter((value) => (this.lookingFor & value) === value).reduce((result, value) => result + value, 0) !== lookingFor) {
        throw new WOLFAPIError('lookingFor must is not valid', { lookingFor });
      }
    }

    if (relationship) {
      if (!validator.isValidNumber(relationship)) {
        throw new WOLFAPIError('relationship must be a valid number', { relationship });
      } else if (!Object.values(Relationship).includes(parseInt(relationship))) {
        throw new WOLFAPIError('relationship is not valid', { relationship });
      }
    }

    const avatarConfig = this._frameworkConfig.get('multimedia.avatar.subscriber');

    if (avatar) {
      if (!Buffer.isBuffer(avatar)) {
        throw new WOLFAPIError('avatar must be a valid buffer', { thumbnail: avatar });
      }

      validateMultimediaConfig(avatarConfig, avatar);
    }

    const response = await this.websocket.emit(
      Command.SUBSCRIBER_PROFILE_UPDATE,
      {
        nickname: nickname || this.currentSubscriber.nickname,
        status: (status === null || status) ? status : this.currentSubscriber.status,
        categoryIds: (categoryIds === null || categoryIds) ? categoryIds : this.currentSubscriber.categoryIds,
        extended: {
          dateOfBirth: (dateOfBirth === null || dateOfBirth) ? dateOfBirth : this.currentSubscriber.extended.dateOfBirth,
          about: (about === null || about) ? about : this.currentSubscriber.extended.about,
          gender: (gender === null || gender) ? gender : this.currentSubscriber.extended.gender,
          language: (language === null || language) ? language : this.currentSubscriber.extended.language,
          lookingFor: (lookingFor === null || lookingFor) ? lookingFor : this.currentSubscriber.extended.lookingFor,
          name: (name === null || name) ? name : this.currentSubscriber.extended.name,
          relationship: (relationship === null || relationship) ? relationship : this.currentSubscriber.extended.relationship,
          urls: (urls === null || urls) ? urls : this.currentSubscriber.extended.urls
        }
      }
    );

    if (response.success && avatar) {
      response.body.avatarUpload = await this.multimedia.request(
        avatarConfig,
        {
          data: avatar.toString('base64'),
          mimeType: (await fileTypeFromBuffer(avatar)).mime
        }
      );
    }

    return response;
  }

  get SPLIT_REGEX () {
    return /[\n\t,،\s+]/g;
  }

  /**
   * Clear all cache arrays and objects
   */
  _cleanUp (reconnection = false) {
    this.achievement._cleanUp(reconnection);
    this.charm._cleanUp(reconnection);
    this.contact._cleanUp(reconnection);
    this.discovery._cleanUp(reconnection);
    this.event._cleanUp(reconnection);
    this.channel._cleanUp(reconnection);
    this.messaging._cleanUp(reconnection);
    this.misc._cleanUp(reconnection);
    this.notification._cleanUp(reconnection);
    this.role._cleanUp(reconnection);
    this.stage._cleanUp(reconnection);
    this.store._cleanUp(reconnection);
    this.subscriber._cleanUp(reconnection);
    this.tipping._cleanUp(reconnection);
    this.topic._cleanUp(reconnection);
  }
}

export default WOLF;
