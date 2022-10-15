import EventEmitter from 'events';
import { LoginType, OnlineState, Command } from '../constants/index.js';
import Websocket from './websocket/Websocket.js';
import Multimedia from './multimedia/Client.js';
import CommandHandler from '../command/CommandHandler.js';
import Achievement from '../helper/achievement/Achievement.js';
import Banned from '../helper/banned/Banned.js';
import Charm from '../helper/charm/Charm.js';
import Contact from '../helper/contact/Contact.js';
import Discovery from '../helper/discovery/Discovery.js';
import Event from '../helper/event/Event.js';
import Group from '../helper/group/Group.js';
import Messaging from '../helper/messaging/Messaging.js';
import Notification from '../helper/notification/Notification.js';
import Phrase from '../helper/phrase/Phrase.js';
import Stage from '../helper/stage/Stage.js';
import Store from '../helper/store/Store.js';
import Subscriber from '../helper/subscriber/Subscriber.js';
import Tipping from '../helper/tipping/Tipping.js';
import Utility from '../utility/Utility.js';
import { configuration, generateToken } from '../utils/index.js';
import validator from '../validator/index.js';
import { WOLFAPIError } from '../models/index.js';

// #endregion
class WOLF extends EventEmitter {
  constructor () {
    super();

    this.utility = new Utility(this);

    configuration(this);

    this.websocket = new Websocket(this);
    this.multimedia = new Multimedia(this);
    this.utility = new Utility(this);
    this.commandHandler = new CommandHandler(this);
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
  }

  login () {
    const loginDetails = this.config.get('framework.login');

    if (!loginDetails) {
      throw new WOLFAPIError('loginDetails must be set in config');
    }

    const { email, password, onlineState } = loginDetails;

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

    this.websocket._create();
  }

  async logout () {
    this.websocket.emit(Command.SECURITY_LOGOUT);
    // TODO: cache handling
  }

  async meatdata (url) {
    if (validator.isNullOrUndefined(url)) {
      throw new WOLFAPIError('url cannot be null or empty', { url });
    } else if (typeof url !== 'string') {
      throw new WOLFAPIError('url must be type string', { url });
    }

    return await this.websocket.emit(Command.METADATA_URL, {
      headers: {
        version: 2
      },
      body: { url }
    });
  }

  get SPLIT_REGEX () {
    return /[\n\t,،\s+]/g;
  }
}

export default WOLF;
