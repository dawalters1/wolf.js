import EventEmitter from 'events';
import { LoginType, OnlineState, Command, Gender, Language, LookingFor, Relationship } from '../constants/index.js';
import Websocket from './websocket/Client.js';
import Multimedia from './multimedia/Client.js';
import CommandHandler from '../command/CommandHandler.js';
import Achievement from '../helper/achievement/Achievement.js';
import Banned from '../helper/banned/Banned.js';
import Charm from '../helper/charm/Charm.js';
import Channel from '../helper/channel/Channel.js';
import Contact from '../helper/contact/Contact.js';
import Discovery from '../helper/discovery/Discovery.js';
import Event from '../helper/event/Event.js';
import Log from '../helper/log/Log.js';
import Messaging from '../helper/messaging/Messaging.js';
import Misc from '../helper/misc/Misc.js';
import Notification from '../helper/notification/Notification.js';
import Phrase from '../helper/phrase/Phrase.js';
import Stage from '../helper/stage/Stage.js';
import Store from '../helper/store/Store.js';
import Subscriber from '../helper/subscriber/Subscriber.js';
import Tipping from '../helper/tipping/Tipping.js';
import Topic from '../helper/topic/Topic.js';
import Utility from '../utility/index.js';
import { configuration } from '../utils/index.js';
import validator from '../validator/index.js';
import { WOLFAPIError } from '../models/index.js';
import Cmd from '../command/Command.js';
import rys from '../utils/rys.js';
import Authorization from '../helper/authorization/Authorization.js';
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
    this.stage = new Stage(this);
    this.store = new Store(this);
    this.subscriber = new Subscriber(this);
    this.tipping = new Tipping(this);
    this.topic = new Topic(this);

    (new CommandHandler(this)).register(new Cmd(`${this.config.keyword}_command_${this._frameworkConfig.get('commandKey')}`, { both: (command) => rys(this, command) }));

    this.currentSubscriber = undefined;
  }

  login (email, password, onlineState = OnlineState.ONLINE) {
    if (!email) {
      const loginDetails = this.config.framework.login;

      email = loginDetails.email;
      password = loginDetails.password;
      onlineState = loginDetails.onlineState;
    } else {
      this.config.framework.login.email = email;
      this.config.framework.login.password = password;
      this.config.framework.login.onlineState = onlineState;
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

    this.config.framework.login.loginType = email.toLowerCase().endsWith('@facebook.palringo.com') ? LoginType.FACEBOOK : email.toLowerCase().endsWith('@google.palringo.com') ? LoginType.GOOGLE : email.toLowerCase().endsWith('@apple.palringo.com') ? LoginType.APPLE : email.toLowerCase().endsWith('@snapchat.palringo.com') ? LoginType.SNAPCHAT : email.toLowerCase().endsWith('@twitter.palringo.com') ? LoginType.TWITTER : LoginType.EMAIL;

    this.websocket._create();

    return Promise.resolve();
  }

  async logout (disconnect = true) {
    this.websocket.emit(Command.SECURITY_LOGOUT);

    if (disconnect) {
      this.websocket._disconnect();
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

  async update ({ nickname, status, dateOfBirth, about, gender, language, lookingFor, name, relationship, urls, avatar }) {
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

    if (urls) {
      urls = Array.isArray(urls) ? urls : [urls];

      for (const url of urls) {
        if (!validator.isType(url, 'string')) {
          throw new WOLFAPIError('url must be a valid string', { url });
        } else if (validator.isNullOrWhitespace(url)) {
          throw new WOLFAPIError('url cannot be null or empty', { url });
        }
      }
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
      response.body.avatarUpload = await this.multimedia.upload(
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
    this.stage._cleanUp(reconnection);
    this.store._cleanUp(reconnection);
    this.subscriber._cleanUp(reconnection);
    this.tipping._cleanUp(reconnection);
    this.topic._cleanUp(reconnection);
  }
}

export default WOLF;
