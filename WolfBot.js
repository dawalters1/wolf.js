const path = require('path');
const fs = require('fs');

const Websocket = require('./networking/Websocket');
const CommandHandler = require('./Command/CommandHandler');

const EventManager = require('./networking/events/EventManager');
const Achievement = require('./helper/Achievement/Achievement');
const Authorization = require('./helper/Authorization/Authorization');
const Banned = require('./helper/Banned/Banned');
const Blocked = require('./helper/Blocked/Blocked');
const Charm = require('./helper/Charm/Charm');
const Contact = require('./helper/Contact/Contact');
const Group = require('./helper/Group/Group');
const Messaging = require('./helper/Messaging/Messaging');
const Notification = require('./helper/Notification/Notification');
const Phrase = require('./helper/Phrase/Phrase');
const Stage = require('./helper/Stage/Stage');
const Subscriber = require('./helper/Subscriber/Subscriber');
const Tip = require('./helper/Tip/Tip');

const yaml = require('yaml');

const validator = require('@dawalters1/validator');
const crypto = require('crypto');
const Utilities = require('./utility');

const request = require('./constants/request');

const constants = require('@dawalters1/constants');
const routes = require('@dawalters1/wolf.js.mms/constants/routes');
const uploadToMediaService = require('./utils/uploadToMediaService');

const validateConfig = (bot, config) => {
  if (!config) {
    throw new Error('config cannot be null or empty\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  if (!config.keyword) {
    throw new Error('app must contain keyword\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  } else if (validator.isNullOrWhitespace(config.keyword)) {
    throw new Error('keyword cannot be null or empty\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  if (!config.app) {
    throw new Error('config must contain app\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  const app = config.app;
  if (!app.defaultLanguage) {
    throw new Error('config must contain a defaultLanguage\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  if (validator.isNullOrWhitespace(app.defaultLanguage)) {
    throw new Error('defaultLanguage must be a string\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  if (!app.loginSettings) {
    throw new Error('config must contain loginSettings\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  const loginSettings = app.loginSettings;

  if (!loginSettings.email) {
    throw new Error('loginSettings must contain email\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  } else if (validator.isNullOrWhitespace(loginSettings.email)) {
    throw new Error('email cannot be null or empty\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  if (!loginSettings.password) {
    throw new Error('loginSettings must contain password\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  } else if (validator.isNullOrWhitespace(loginSettings.password)) {
    throw new Error('password cannot be null or empty\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  if (!loginSettings.loginDevice) {
    throw new Error('loginSettings must contain loginDevice\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  } else if (!Object.values(constants.loginDevice).includes(loginSettings.loginDevice)) {
    throw new Error('loginDevice is invalid\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  if (!loginSettings.onlineState) {
    throw new Error('loginSettings must contain onlineState\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  } else if (!Object.values(constants.onlineState).includes(loginSettings.onlineState)) {
    throw new Error('onlineState is invalid\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  if (!loginSettings.loginType) {
    throw new Error('loginSettings must contain loginType\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  } else if (!Object.values(constants.loginType).includes(loginSettings.loginType)) {
    throw new Error('loginType is invalid\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  config.options = {
  };

  if (!app.commandSettings) {
    throw new Error('app must contain commandSettings\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  const commandSettings = app.commandSettings;

  if (!commandSettings.ignoreOfficialBots) {
    throw new Error('commandSettings must contain ignoreOfficialBots\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  } else if (!validator.isValidBoolean(commandSettings.ignoreOfficialBots)) {
    throw new Error('ignoreOfficialBots is not a valid boolean\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
  }

  config.options.ignoreOfficialBots = commandSettings.ignoreOfficialBots;

  if (app.defaultLanguage) {
    config.options.defaultLanguage = app.defaultLanguage || 'en';
  };

  config.options.token = loginSettings.token || crypto.randomBytes(32).toString('hex');

  bot.config = config;
};

module.exports = class WolfBot {
  constructor () {
    const configPath = path.join(path.dirname(require.main.filename), '/config/');

    if (fs.existsSync(configPath)) {
      if (fs.existsSync(`${configPath}/default.yaml`)) {
        validateConfig(this, yaml.parse(fs.readFileSync(`${configPath}/default.yaml`, 'utf-8')));
      } else {
        throw new Error('File default.yaml missing in config folder\nSee https://github.com/dawalters1/Bot-Template/blob/main/config/default.yaml');
      }
    } else {
      throw new Error('Folder config missing\nSee https://github.com/dawalters1/Bot-Template/tree/main/config');
    }

    this._eventManager = new EventManager(this);
    this.websocket = new Websocket(this);
    this.commandHandler = new CommandHandler(this);

    this._achievement = new Achievement(this);
    this._authorization = new Authorization(this);
    this._banned = new Banned(this);
    this._blocked = new Blocked(this);
    this._charm = new Charm(this);
    this._contact = new Contact(this);
    this._group = new Group(this);
    this._messaging = new Messaging(this);
    this._notification = new Notification(this);
    this._phrase = new Phrase(this);
    this._stage = new Stage(this);
    this._subscriber = new Subscriber(this);
    this._tip = new Tip(this);
    this.currentSubscriber = null;

    this._utilities = Utilities(this);
  }

  get on () {
    return this._eventManager;
  }

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

  charm () {
    return this._charm;
  }

  contact () {
    return this._contact;
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
    return this._stage;
  }

  subscriber () {
    return this._subscriber;
  }

  tip () {
    return this._tip;
  }

  utility () {
    return this._utilities;
  }

  login () {
    this._eventManager._register();
    this.websocket.create();
  }

  logout () {
    this.websocket.emit(request.SECURITY_LOGOUT);

    this.websocket.socket.disconnect();

    this._eventManager._unregister();

    this._stage._cache = {};

    this._cleanUp();
  }

  async setOnlineState (onlineState) {
    try {
      if (!validator.isValidNumber(onlineState)) {
        throw new Error('onlineState must be a valid number');
      } else if (!Object.values(constants.onlineState).includes(onlineState)) {
        throw new Error('onlineState is not valid');
      }

      return await this.websocket.emit(request.SUBSCRIBER_SETTINGS_UPDATE, {
        state: {
          state: onlineState
        }
      });
    } catch (error) {
      error.method = `WolfBot/setOnlineState(onlineState = ${JSON.stringify(onlineState)})`;
      throw error;
    }
  }

  async setSelectedCharms (charms) {
    try {
      if (validator.isValidArray(charms)) {
        for (const charm of charms) {
          if (charm) {
            if (charm.position) {
              if (!validator.isValidNumber(charm.position)) {
                throw new Error('position must be a valid number');
              } else if (validator.isLessThanZero(charm.position)) {
                throw new Error('position must be larger than or equal to 0');
              }
            } else {
              throw new Error('charm must contain a position');
            }

            if (charm.charmId) {
              if (!validator.isValidNumber(charm.charmId)) {
                throw new Error('charmId must be a valid number');
              } else if (validator.isLessThanOrEqualZero(charm.charmId)) {
                throw new Error('charmId cannot be less than or equal to 0');
              }
            } else {
              throw new Error('charm must contain a charmId');
            }
          } else {
            throw new Error('charm cannot be null or empty');
          }
        }
      } else {
        if (charms) {
          if (charms.position) {
            if (!validator.isValidNumber(charms.position)) {
              throw new Error('position must be a valid number');
            } else if (validator.isLessThanZero(charms.position)) {
              throw new Error('position must be larger than or equal to 0');
            }
          } else {
            throw new Error('charm must contain a position');
          }

          if (charms.charmId) {
            if (!validator.isValidNumber(charms.charmId)) {
              throw new Error('charmId must be a valid number');
            } else if (validator.isLessThanOrEqualZero(charms.charmId)) {
              throw new Error('charmId cannot be less than or equal to 0');
            }
          } else {
            throw new Error('charm must contain a charmId');
          }
        } else {
          throw new Error('charm cannot be null or empty');
        }
      }

      return await this.websocket.emit(request.CHARM_SUBSCRIBER_SET_SELECTED, {
        selectedList: validator.isValidArray(charms) ? charms : [charms]
      });
    } catch (error) {
      error.method = `WolfBot/setSelectedCharms(charms = ${JSON.stringify(charms)})`;
      throw error;
    }
  }

  async deleteCharms (charmIds) {
    try {
      if (validator.isValidArray(charmIds)) {
        if (charmIds.length === 0) {
          throw new Error('charmIds cannot be an empty array');
        }

        for (const charmId of charmIds) {
          if (!validator.isValidNumber(charmId)) {
            throw new Error('charmId must be a valid number');
          } else if (validator.isLessThanOrEqualZero(charmIds)) {
            throw new Error('charmId cannot be less than or equal to 0');
          }
        }
      } else {
        if (charmIds) {
          if (!validator.isValidNumber(charmIds)) {
            throw new Error('charmIds must be a valid number');
          } else if (validator.isLessThanOrEqualZero(charmIds)) {
            throw new Error('charmIds cannot be less than or equal to 0');
          }
        }
      }

      return await this.websocket.emit(request.CHARM_SUBSCRIBER_DELETE, {
        idList: validator.isValidArray(charmIds) ? charmIds : [charmIds]
      });
    } catch (error) {
      error.method = `WolfBot/deleteCharms(charmIds = ${JSON.stringify(charmIds)})`;
      throw error;
    }
  }

  async getMessageSettings () {
    return await this.websocket.emit(request.MESSAGE_SETTING);
  }

  async setMessageSettings (messageFilterTier) {
    try {
      if (!validator.isValidNumber(messageFilterTier)) {
        throw new Error('messageFilterTier must be a valid number');
      } else if (!Object.values(constants.messageFilter).includes(messageFilterTier)) {
        throw new Error('messageFilterTier is not valid');
      }

      return await this.websocket.emit(request.MESSAGE_SETTING_UPDATE, {
        spamFilter: {
          enabled: messageFilterTier !== constants.messageFilter.OFF,
          tier: messageFilterTier
        }
      });
    } catch (error) {
      error.method = `WolfBot/setMessageSettings(messageFilterTier = ${JSON.stringify(messageFilterTier)})`;
      throw error;
    }
  }

  async updateAvatar (avatar) {
    try {
      return await uploadToMediaService(this, routes.SUBSCRIBER_AVATAR_UPLOAD, avatar);
    } catch (error) {
      error.method = `WolfBot/updateAvatar(avatar = ${JSON.stringify('Too big, not displaying this')})`;
      throw error;
    }
  }

  _cleanUp () {
    this._blocked._cleanUp();
    this._contact._cleanUp();
    this._charm._cleanUp();
    this._group._cleanUp();
    this._subscriber._cleanUp();
    this._notification._cleanUp();
    this._achievement._cleanUp();
    this._achievement.group()._cleanUp();
    this._achievement.subscriber()._cleanUp();
    this.currentSubscriber = null;
    this._stage._cleanUp();
  }
};
