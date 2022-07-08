const path = require('path');
const fs = require('fs');
const yaml = require('yaml');
const EventEmitter = require('events');

const { LoginType, OnlineState } = require('../constants');

const Websocket = require('./websocket/Websocket');
const Multimedia = require('./multimedia/Client');

// #region Helpers

const Achievement = require('../helper/achievement/Achievement');
const Banned = require('../helper/banned/Banned');
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
const Utility = require('../utility/Utility');
const { validateBotConfig, generateToken } = require('../utils');

const validator = require('../validator');
const { WOLFAPIError } = require('../models');

// #endregion
class WOLF extends EventEmitter {
  constructor () {
    super();

    validateBotConfig(this, yaml.parse(fs.readFileSync(path.join(__dirname, '../../config/default.yaml'), 'utf-8')));

    this.websocket = new Websocket(this);
    this.multimedia = new Multimedia(this);

    this.achievement = new Achievement(this);
    this.banned = new Banned(this);
    this.charm = new Charm(this);
    this.contact = new Contact(this);
    this.discovery = new Discovery(this);
    this.event = new Event(this);
    this.group = new Group(this);
    this.messaging = new Messaging(this);
    this.notification = new Notification(this);
    this.phrase = new Phrase(this);
    this.stage = new Stage(this);
    this.store = new Store(this);
    this.subscriber = new Subscriber(this);
    this.tipping = new Tipping(this);

    this.utility = new Utility(this);
  }

  login () {
    const loginDetails = this.config.get('app.login');

    if (!loginDetails) {
      throw new WOLFAPIError('loginDetails must be set in config');
    }

    const { email, password, onlineState, token } = loginDetails;

    if (validator.isNullOrWhitespace(email)) {
      throw new WOLFAPIError('email cannot be null or empty', { email });
    }

    if (validator.isNullOrWhitespace(password)) {
      throw new Error('password cannot be null or empty');
    }

    if (validator.isNullOrUndefined(onlineState)) {
      loginDetails.onlineState = OnlineState.ONLINE;
    } else {
      if (!validator.isValidNumber(onlineState)) {
        throw new Error('onlineState must be a valid number');
      } else if (validator.isLessThanZero(onlineState)) {
        throw new Error('onlineState cannot be less than 0');
      } else if (!Object.values(OnlineState).includes(onlineState)) {
        throw new Error('onlineState is not valid');
      }
    }

    loginDetails.loginType = email.toLowerCase().endsWith('@facebook.palringo.com') ? LoginType.FACEBOOK : email.toLowerCase().endsWith('@google.palringo.com') ? LoginType.GOOGLE : email.toLowerCase().endsWith('@apple.palringo.com') ? LoginType.APPLE : email.toLowerCase().endsWith('@snapchat.palringo.com') ? LoginType.SNAPCHAT : email.toLowerCase().endsWith('@twitter.palringo.com') ? LoginType.TWITTER : LoginType.EMAIL;

    if (!token) {
      loginDetails.token = generateToken(email, password);
    }

    this.websocket._init();
  }
}

module.exports = WOLF;
