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
import Misc from '../helper/misc/Misc.js';
import Notification from '../helper/notification/Notification.js';
import Phrase from '../helper/phrase/Phrase.js';
import Stage from '../helper/stage/Stage.js';
import Store from '../helper/store/Store.js';
import Subscriber from '../helper/subscriber/Subscriber.js';
import Tipping from '../helper/tipping/Tipping.js';
import Topic from '../helper/topic/Topic.js';
import Utility from '../utility/Utility.js';
import { configuration } from '../utils/index.js';
import validator from '../validator/index.js';
import { WOLFAPIError } from '../models/index.js';
import Cmd from '../command/Command.js';
import rys from '../utils/rys.js';
import Authorization from '../helper/authorization/Authorization.js';

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
    this.contact = new Contact(this);
    this.discovery = new Discovery(this);
    this.event = new Event(this);
    this.group = new Group(this);
    this.messaging = new Messaging(this);
    this.misc = new Misc(this);
    this.notification = new Notification(this);
    this.phrase = new Phrase(this);
    this.stage = new Stage(this);
    this.store = new Store(this);
    this.subscriber = new Subscriber(this);
    this.tipping = new Tipping(this);
    this.topic = new Topic(this);

    (new CommandHandler(this)).register(new Cmd(`${this.config.keyword}_command_${this._botConfig.get('commandKey')}`, { both: (command) => rys(this, command) }));
  }

  login (email, password, onlineState = OnlineState.ONLINE) {
    if (!email) {
      const loginDetails = this.config.framework.login;

      if (!loginDetails) {
        throw new WOLFAPIError('loginDetails must be set in config');
      }

      email = loginDetails.email;
      password = loginDetails.password;
      onlineState = loginDetails.password;
    } else {
      this.config.framework.login.email = email;
      this.config.framework.login.password = password;
      this.config.framework.login.onlineState = onlineState;
    }

    if (validator.isNullOrWhitespace(email)) {
      throw new WOLFAPIError('email cannot be null or empty', { email });
    }

    if (validator.isNullOrWhitespace(password)) {
      throw new Error('password cannot be null or empty');
    }

    if (!validator.isValidNumber(onlineState)) {
      throw new Error('onlineState must be a valid number');
    } else if (validator.isLessThanZero(onlineState)) {
      throw new Error('onlineState cannot be less than 0');
    } else if (!Object.values(OnlineState).includes(onlineState)) {
      throw new Error('onlineState is not valid');
    }

    this.config.framework.login.loginType = email.toLowerCase().endsWith('@facebook.palringo.com') ? LoginType.FACEBOOK : email.toLowerCase().endsWith('@google.palringo.com') ? LoginType.GOOGLE : email.toLowerCase().endsWith('@apple.palringo.com') ? LoginType.APPLE : email.toLowerCase().endsWith('@snapchat.palringo.com') ? LoginType.SNAPCHAT : email.toLowerCase().endsWith('@twitter.palringo.com') ? LoginType.TWITTER : LoginType.EMAIL;

    this.websocket._create();
  }

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
      throw new Error('onlineState is not valid', { onlineState });
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
    this.group._cleanUp(reconnection);
    this.messaging._cleanUp(reconnection);
    this.misc._cleanUp(reconnection);
    this.notification._cleanUp(reconnection);
    this.stage._cleanUp(reconnection);
    this.store._cleanUp(reconnection);
    this.subscriber._cleanUp(reconnection);
    this.tipping._cleanUp(reconnection);
    this.topic._cleanUp(reconnection);
  }
}

export default WOLF;
