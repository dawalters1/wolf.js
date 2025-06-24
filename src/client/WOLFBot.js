const path = require('path');
const fs = require('fs');
const yaml = require('yaml');
const fileType = require('file-type');
const { Commands, LoginDevice, LoginType, OnlineState, MessageFilterTier, Events } = require('../constants');

const validator = require('../validator');

const SubscriberProfileBuilder = require('../utils/ProfileBuilders/Subscriber');

const crypto = require('crypto');

const EventEmitter = require('events').EventEmitter;

const Websocket = require('./networking/websocket/Websocket');
const MultiMediaService = require('./networking/multimedia');

const CommandHandler = require('../command/CommandHandler');

const Achievement = require('../helper/achievement/Achievement');
const Authorization = require('../helper/authorization/Authorization');
const Banned = require('../helper/banned/Banned');
const Blocked = require('../helper/blocked/Blocked');
const Charm = require('../helper/charm/Charm');
const Contact = require('../helper/contact/Contact');
const Discovery = require('../helper/discovery/Discovery');
const Event = require('../helper/event/Event');
const Group = require('../helper/group/Group');
const Messaging = require('../helper/messaging/Messaging');
const Notification = require('../helper/notification/Notification');
const Phrase = require('../helper/phrase/Phrase');
const Stage = require('../helper/stage/Stage');
const Store = require('../helper/store/Store');
const Subscriber = require('../helper/subscriber/Subscriber');
const Tipping = require('../helper/tipping/Tipping');
const Topic = require('../helper/topic/Topic');

const Utility = require('../utils');
const { validateUserConfig, validateBotConfig } = require('../utils/Config');

class WOLFBot extends EventEmitter {
  constructor () {
    super();

    const configPath = path.join(path.dirname(require.main.filename), '/config/');

    if (fs.existsSync(configPath) && fs.existsSync(`${configPath}/default.yaml`)) {
      validateUserConfig(this, yaml.parse(fs.readFileSync(`${configPath}/default.yaml`, 'utf-8')));
    } else {
      validateUserConfig(this, {});
      this.emit(Events.INTERNAL_ERROR, !fs.existsSync(configPath) ? '[WARNING]: mising config folder\nSee https://github.com/dawalters1/Bot-Template/tree/main/config' : '[WARNING]: missing default.yaml missing in config folder\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
    }

    validateBotConfig(this, yaml.parse(fs.readFileSync(path.join(__dirname, '../../config/default.yaml'), 'utf-8')));

    this._utility = new Utility(this);

    this._websocket = new Websocket(this);
    this._multiMediaService = new MultiMediaService(this);
    this._commandHandler = new CommandHandler(this);

    this._achievement = new Achievement(this);
    this._authorization = new Authorization(this);
    this._banned = new Banned(this);
    this._blocked = new Blocked(this);
    this._charm = new Charm(this);
    this._contact = new Contact(this);
    this._discovery = new Discovery(this);
    this._event = new Event(this);
    this._group = new Group(this);
    this._messaging = new Messaging(this);
    this._notification = new Notification(this);
    this._phrase = new Phrase(this);
    this._stage = new Stage(this);
    this._store = new Store(this);
    this._subscriber = new Subscriber(this);
    this._tipping = new Tipping(this);
    this._topic = new Topic(this);

    this._currentSubscriber = undefined;

    this._blacklist = [];
  }

  get SPLIT_REGEX () {
    return /[\n\t,،\s+]/g;
  }

  /**
   * The current account logged in
   */
  get currentSubscriber () {
    return this._currentSubscriber;
  }

  /**
   * The config settings
   */
  get config () {
    return this._config;
  }

  /**
   * Simplified config settings
   */
  get options () {
    return this._options;
  }

  // #region Networking Clients

  /**
   * The websocket client
   */
  get websocket () {
    return this._websocket;
  }

  /**
   *  Exposes the multiMediaService methods
   * @returns {MultiMediaService}
   */
  multiMediaService () {
    return this._multiMediaService;
  }

  // #endregion

  /**
   * Exposes the commandHandler methods
   * @returns {CommandHandler}
   */
  commandHandler () {
    return this._commandHandler;
  }

  // #region  Helpers

  /**
   * Exposes the achievement methods
   * @returns {Achievement}
   */
  achievement () {
    return this._achievement;
  }

  /**
   * Exposes the authorization methods
   * @returns {Authorization}
   */
  authorization () {
    return this._authorization;
  }

  /**
   * Exposes the banned methods
   * @returns {Banned}
   */
  banned () {
    return this._banned;
  }

  /**
   * Exposes the blocked methods
   * @returns {Blocked}
   */
  blocked () {
    return this._blocked;
  }

  /**
   * Exposes the contact methods
   * @returns {Contact}
   */
  contact () {
    return this._contact;
  }

  /**
   * Exposes the charm methods
   * @returns {Charm}
   */
  charm () {
    return this._charm;
  }

  /**
   * Exposes the discovery methods
   * @returns {Discovery}
   */
  discovery () {
    return this._discovery;
  }

  /**
   * Exposes the event methods
   * @returns {Event}
   */
  event () {
    return this._event;
  }

  /**
   * Exposes the group methods
   * @returns {Group}
   */
  group () {
    return this._group;
  }

  /**
   * Exposes the messaging methods
   * @returns {Messaging}
   */
  messaging () {
    return this._messaging;
  }

  /**
   * Exposes the notification methods
   * @returns {Notification}
   */
  notification () {
    return this._notification;
  }

  /**
   * Exposes the phrase methods
   * @returns {Phrase}
   */
  phrase () {
    return this._phrase;
  }

  /**
   * Exposes the stage methods
   * @returns {Stage}
   */
  stage () {
    return this._stage;
  }

  /**
   * Exposes the store methods
   * @returns {Store}
   */
  store () {
    return this._store;
  }

  /**
   * Exposes the subscriber methods
   * @returns {Subscriber}
   */
  subscriber () {
    return this._subscriber;
  }

  /**
   * Exposes the tipping methods
   * @returns {Tipping}
   */
  tipping () {
    return this._tipping;
  }

  /**
   * Exposes the Topic methods
   * @returns {Topic}
   */
  topic () {
    return this._topic;
  }
  // #endregion

  /**
   * Exposes the utility methods
   * @returns {Utility}
   */
  utility () {
    return this._utility;
  }

  /**
   *
   * @param {String} email - The email belonging to the account
   * @param {String} password - The password belonging to the account
   * @param {Number} onlineState - The online state to appear as
   * @param {String} loginType - The account type
   * @param {String} token - The token to use to log in (Automatically generated if not provided)
   */
  login (email, password, apiKey = undefined, onlineState = OnlineState.ONLINE, loginType = LoginType.EMAIL, token = undefined) {
    try {
      if (validator.isNullOrWhitespace(email)) {
        throw new Error('email cannot be null or empty');
      }

      if (validator.isNullOrWhitespace(password)) {
        throw new Error('password cannot be null or empty');
      }

      if (Object.values(LoginDevice).includes(onlineState)) {
        throw new Error('parameter loginDevice is deprecated');
      }

      if (validator.isNullOrUndefined(onlineState)) {
        throw new Error('onlineState cannot be null or undefined');
      } else if (!validator.isValidNumber(onlineState)) {
        throw new Error('onlineState must be a valid number');
      } else if (validator.isLessThanZero(onlineState)) {
        throw new Error('onlineState cannot be less than 0');
      } else if (!Object.values(OnlineState).includes(onlineState)) {
        throw new Error('onlineState is not valid');
      }

      if (validator.isNullOrWhitespace(loginType)) {
        throw new Error('loginType must be a valid string');
      } else if (!Object.values(LoginType).includes(loginType)) {
        throw new Error('loginType is not valid');
      }

      this.config._loginSettings = {
        email,
        password,
        onlineState,
        loginType,
        apiKey,
        token: token && !validator.isNullOrWhitespace(token) ? token : crypto.randomBytes(32).toString('hex')
      };

      this.websocket._init();
    } catch (error) {
      error.internalErrorMessage = `api.login(email=${JSON.stringify(email)}, password=${JSON.stringify(password)}, apiKey=${JSON.stringify(apiKey)} onlineState=${JSON.stringify(onlineState)}, loginType=${JSON.stringify(loginType)}, token=${JSON.stringify(token)})`;
      throw error;
    }
  }

  logout () {
    this.websocket.emit(Commands.SECURITY_LOGOUT);

    this.websocket.socket.disconnect();

    this._cleanup(true);
  }

  // #region Methods

  async getSecurityToken (requestNew = false) {
    try {
      if (!requestNew && this.cognito) {
        return this.cognito;
      }

      const result = await this.websocket.emit(Commands.SECURITY_TOKEN_REFRESH);

      if (result.success) {
        this.cognito = result.body;
      } else {
        throw new Error(result.headers.message || 'Error occurred while requesting new security token');
      }

      return this.cognito;
    } catch (error) {
      error.internalErrorMessage = `api.getSecurityToken(requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async setOnlineState (onlineState) {
    try {
      if (validator.isNullOrUndefined(onlineState)) {
        throw new Error('onlineState cannot be null or undefined');
      } else if (!validator.isValidNumber(onlineState)) {
        throw new Error('onlineState must be a valid number');
      } else if (validator.isLessThanZero(onlineState)) {
        throw new Error('onlineState cannot be less than 0');
      } else if (!Object.values(OnlineState).includes(onlineState)) {
        throw new Error('onlineState is not valid');
      }

      return await this.websocket.emit(Commands.SUBSCRIBER_SETTINGS_UPDATE, {
        state: {
          state: onlineState
        }
      });
    } catch (error) {
      error.internalErrorMessage = `api.setOnlineState(onlineState=${JSON.stringify(onlineState)})`;
      throw error;
    }
  }

  async search (query) {
    try {
      if (validator.isNullOrWhitespace(query)) {
        throw new Error('query cannot be null or empty');
      }

      return await this.websocket.emit(Commands.SEARCH, {
        query,
        types: ['related', 'groups']
      });
    } catch (error) {
      error.internalErrorMessage = `api.search(query=${JSON.stringify(query)})`;
      throw error;
    }
  }

  async getLinkMetadata (link) {
    try {
      if (validator.isNullOrWhitespace(link)) {
        throw new Error('link cannot be null or empty');
      }

      return await this.websocket.emit(
        Commands.METADATA_URL,
        {
          headers: {
            version: 2
          },
          body: { url: link }
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.getLinkMetadata(link=${JSON.stringify(link)})`;
      throw error;
    }
  }

  async getLinkBlacklist (requestNew = false) {
    try {
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      if (!requestNew && this._blacklist.length > 0) {
        return this._blacklist;
      }

      const result = await this.websocket.emit(Commands.METADATA_URL_BLACKLIST);

      if (result.success) {
        this._blacklist = result.body;
      }

      return this._blacklist;
    } catch (error) {
      error.internalErrorMessage = `api.getLinkBlacklist(requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getMessageSettings () {
    return await this.websocket.emit(Commands.MESSAGE_SETTING);
  }

  async setMessageSettings (messageFilterTier) {
    try {
      if (validator.isNullOrUndefined(messageFilterTier)) {
        throw new Error('messageFilterTier cannot be null or undefined');
      } else if (!validator.isValidNumber(messageFilterTier)) {
        throw new Error('messageFilterTier must be a valid number');
      } else if (validator.isLessThanZero(messageFilterTier)) {
        throw new Error('messageFilterTier cannot be less than 0');
      } else if (!Object.values(MessageFilterTier).includes(messageFilterTier)) {
        throw new Error('messageFilterTier is not valid');
      }

      return await this.websocket.emit(
        Commands.MESSAGE_SETTING_UPDATE,
        {
          spamFilter: {
            enabled: messageFilterTier !== MessageFilterTier.OFF,
            tier: messageFilterTier
          }
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.setMessageSettings(messageFilterTier=${JSON.stringify(messageFilterTier)})`;
      throw error;
    }
  }

  async updateAvatar (avatar) {
    try {
      return await this.multiMediaService().uploadSubscriberAvatar(avatar, (await fileType.fromBuffer(avatar)).mime);
    } catch (error) {
      error.internalErrorMessage = `api.updateAvatar(avatar=${JSON.stringify(Buffer.isBuffer(avatar) ? 'Buffer -- Too long to display' : avatar)})`;
      throw error;
    }
  }

  updateProfile () {
    return new SubscriberProfileBuilder(this, this.currentSubscriber);
  }
  // #endregion

  async _cleanup (disconnected = false) {
    await Promise.all([
      this._achievement._cleanup(disconnected),
      this._blocked._cleanup(disconnected),
      this._charm._cleanup(disconnected),
      this._contact._cleanup(disconnected),
      this._discovery._cleanup(disconnected),
      this._event._cleanup(disconnected),
      this._group._cleanup(disconnected),
      this._messaging._messageSubscription._cleanup(disconnected),
      this._notification._cleanup(disconnected),
      this._subscriber._cleanup(disconnected),
      this._stage._cleanup(disconnected)
    ]);

    if (disconnected) {
      this._currentSubscriber = null;
      this._utility._timer._reset();
      this._blacklist = [];
    } else if (this._blacklist.length > 0) {
      await this.getLinkBlacklist(true);
    }
  }
}

module.exports = WOLFBot;
