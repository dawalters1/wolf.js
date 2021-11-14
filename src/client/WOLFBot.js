const path = require('path');
const fs = require('fs');
const yaml = require('yaml');
const fileType = require('file-type');
const { Commands } = require('../constants');
const constants = require('../constants');

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

const Utility = require('../utils');
const { validateUserConfig } = require('../utils/Config');

class WOLFBot extends EventEmitter {
  constructor () {
    super();

    const configPath = path.join(path.dirname(require.main.filename), '/config/');

    if (fs.existsSync(configPath) && fs.existsSync(`${configPath}/default.yaml`)) {
      validateUserConfig(this, yaml.parse(fs.readFileSync(`${configPath}/default.yaml`, 'utf-8')));
    } else {
      validateUserConfig(this, {});
      console.warn(!fs.existsSync(configPath) ? '[WARNING]: mising config folder\nSee https://github.com/dawalters1/Bot-Template/tree/main/config' : '[WARNING]: missing default.yaml missing in config folder\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
    }

    this._botConfig = yaml.parse(fs.readFileSync(path.join(__dirname, '../../config/default.yaml'), 'utf-8'));

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

    this._currentSubscriber = undefined;
  }

  get currentSubscriber () {
    return this._currentSubscriber;
  }

  get config () {
    return this._config;
  }

  get options () {
    return this._options;
  }

  // #region Networking Clients

  get websocket () {
    return this._websocket;
  }

  multiMediaService () {
    return this._multiMediaService;
  }

  // #endregion

  commandHandler () {
    return this._commandHandler;
  }

  // #region  Helpers

  achievement () {
    return this._achievement;
  }

  authorization () {
    return this._authorization;
  }

  banned () {
    return this._banned;
  }

  blocked () {
    return this._blocked;
  }

  contact () {
    return this._contact;
  }

  charm () {
    return this._charm;
  }

  discovery () {
    return this._discovery;
  }

  event () {
    return this._event;
  }

  group () {
    return this._group;
  }

  messaging () {
    return this._messaging;
  }

  notification () {
    return this._notification;
  }

  phrase () {
    return this._phrase;
  }

  stage () {
    // return this._stage;
  }

  store () {
    return this._store;
  }

  subscriber () {
    return this._subscriber;
  }

  /**
   * @deprecated Will be removed in 1.0.0
   * @see {@link tipping}
   */
  tip () {
    return this._tipping;
  }

  tipping () {
    return this._tipping;
  }

  // #endregion

  utility () {
    return this._utility;
  }

  login (email, password, loginDevice = constants.LoginDevice.ANDROID, onlineState = constants.OnlineState.ONLINE, loginType = constants.LoginType.EMAIL, token = undefined) {
    try {
      if (validator.isNullOrWhitespace(email)) {
        throw new Error('email cannot be null or empty');
      }

      if (validator.isNullOrWhitespace(password)) {
        throw new Error('password cannot be null or empty');
      }

      if (validator.isNullOrWhitespace(loginDevice)) {
        throw new Error('loginDevice must be a valid string');
      } else if (!Object.values(constants.LoginDevice).includes(loginDevice)) {
        throw new Error('loginDevice is not valid');
      }

      if (validator.isNullOrUndefined(onlineState)) {
        throw new Error('onlineState cannot be null or undefined');
      } else if (!validator.isValidNumber(onlineState)) {
        throw new Error('onlineState must be a valid number');
      } else if (validator.isLessThanZero(onlineState)) {
        throw new Error('onlineState cannot be less than 0');
      } else if (!Object.values(constants.OnlineState).includes(onlineState)) {
        throw new Error('onlineState is not valid');
      }

      if (validator.isNullOrWhitespace(loginType)) {
        throw new Error('loginType must be a valid string');
      } else if (!Object.values(constants.LoginType).includes(loginType)) {
        throw new Error('loginType is not valid');
      }

      this.config._loginSettings = {
        email,
        password,
        loginDevice,
        onlineState,
        loginType,
        token: token && !validator.isNullOrWhitespace(token) ? token : crypto.randomBytes(32).toString('hex')
      };

      this.websocket._init();
    } catch (error) {
      error.internalErrorMessage = `api.login(email=${JSON.stringify(email)}, password=${JSON.stringify(password)}, loginDevice=${JSON.stringify(loginDevice)}, onlineState=${JSON.stringify(onlineState)}, loginType=${JSON.stringify(loginType)}, token=${JSON.stringify(token)})`;
      throw error;
    }
  }

  logout () {
    this.websocket.emit(Commands.SECURITY_LOGOUT);

    this.websocket.socket.disconnect();

    this._cleanup();
  }

  // #region Methods

  async getSecurityToken (requestNew = false) {
    try {
      if (this.cognito && !requestNew) {
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
      } else if (!Object.values(constants.OnlineState).includes(onlineState)) {
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
        { url: link }
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
      } else if (!Object.values(constants.MessageFilterTier).includes(messageFilterTier)) {
        throw new Error('messageFilterTier is not valid');
      }

      return await this.websocket.emit(
        Commands.MESSAGE_SETTING_UPDATE,
        {
          spamFilter: {
            enabled: messageFilterTier !== constants.MessageFilterTier.OFF,
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

  // #region Deprecated methods

  /**
   * @deprecated Will be removed in 1.0.0
   * @use api.charm().set(charms)
   */
  async setSelectedCharms (charms) {
    return this._charm.set(charms);
  }

  /**
   * @deprecated Will be removed in 1.0.0
   * @use api.charm().remove(charmIds)
   */
  async deleteCharms (charmIds) {
    return this._charm.delete(charmIds);
  }

  /**
   * @deprecated Will be removed in 1.0.0
   * @use api.store().getBalance()
   */
  async getCreditBalance () {
    return await this._store.getBalance();
  }

  /**
   * @deprecated Will be removed in 1.0.0
   * @use api.messaging().getConversationList(timestamp)
   */
  async getConversationList (timestamp = undefined) {
    return await this._messaging.getConversationList(timestamp);
  }

  // #endregion

  _cleanup () {
    this._achievement._cleanup();
    this._blocked._cleanup();
    this._charm._cleanup();
    this._contact._cleanup();
    this._discovery._cleanup();
    this._event._cleanup();
    this._group._cleanup();
    this._notification._cleanup();
    this._subscriber._cleanup();
    this._stage._cleanup();

    this._blacklist = [];

    Reflect.deleteProperty(this, 'currentSubscriber');
  }
}

module.exports = WOLFBot;
