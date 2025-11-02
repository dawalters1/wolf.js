import _ from 'lodash';
import AchievementHelper from '../helper/achievement/achievement.js';
import AudioHelper from '../helper/audio/audio.js';
import AuthorisationHelper from '../helper/authorisation/authorisation.js';
import BannedHelper from '../helper/banned/banned.js';
import ChannelHelper from '../helper/channel/channel.js';
import CharmHelper from '../helper/charm/charm.js';
import config from 'config';
import ContactHelper from '../helper/contact/contact.js';
import { EventEmitter } from 'node:events';
import EventHelper from '../helper/event/event.js';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import MessagingHelper from '../helper/messaging/messaging.js';
import MetadataHelper from '../helper/metadata/metadata.js';
import Multimedia from './multimedia/multimedia.js';
import { nanoid } from 'nanoid';
import NotificationHelper from '../helper/notification/notification.js';
import path, { dirname } from 'node:path';
import PhraseHelper from '../helper/phrase/phrase.js';
import RoleHelper from '../helper/role/role.js';
import SecurityHelper from '../helper/security/security.js';
import StoreHelper from '../helper/store/store.js';
import TipHelper from '../helper/tip/tip.js';
import TopicHelper from '../helper/topic/topic.js';
import UserHelper from '../helper/user/user.js';
import { UserPresence as UserPresenceType } from '../constants/index.js';
import Utility from '../utilities/index.js';
import { Websocket } from './websocket/websocket.js';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class WOLF extends EventEmitter {
  #loggedIn = false;
  #me = undefined;
  #config;
  #utility;
  #multimedia;
  #websocket;
  #achievement;
  #audio;
  #authorisation;
  #banned;
  #channel;
  #charm;
  #contact;
  #event;
  #messaging;
  #notification;
  #phrase;
  #user;
  #security;
  #store;
  #tip;
  #topic;
  #role;
  #metadata;
  #commandManager = undefined;

  constructor () {
    super();

    const baseConfig = config.util.toObject();

    const frameworkConfig = yaml.load(
      fs.readFileSync(path.join(__dirname, '../../config/default.yaml'), 'utf-8')
    );

    const botConfig = fs.existsSync(path.join(process.cwd(), '/config/default.yaml'))
      ? yaml.load(fs.readFileSync(path.join(process.cwd(), '/config/default.yaml'), 'utf-8'))
      : {};

    this.#config = _.merge({ get: config.get }, baseConfig, frameworkConfig, botConfig);

    this.#utility = new Utility(this);
    this.#multimedia = new Multimedia(this);
    this.#websocket = new Websocket(this);
    this.#achievement = new AchievementHelper(this);
    this.#audio = new AudioHelper(this);
    this.#authorisation = new AuthorisationHelper(this);
    this.#banned = new BannedHelper(this);
    this.#channel = new ChannelHelper(this);
    this.#charm = new CharmHelper(this);
    this.#contact = new ContactHelper(this);
    this.#event = new EventHelper(this);
    this.#messaging = new MessagingHelper(this);
    this.#notification = new NotificationHelper(this);
    this.#phrase = new PhraseHelper(this);
    this.#user = new UserHelper(this);
    this.#security = new SecurityHelper(this);
    this.#store = new StoreHelper(this);
    this.#tip = new TipHelper(this);
    this.#topic = new TopicHelper(this);
    this.#role = new RoleHelper(this);
    this.#metadata = new MetadataHelper(this);
  }

  get loggedIn () {
    return this.#loggedIn;
  }

  /** @internal */
  set loggedIn (value) {
    this.#loggedIn = value;
  }

  get commandManager () {
    return this.#commandManager ?? undefined;
  }

  /** @internal */
  set commandManager (value) {
    this.#commandManager = value;
  }

  get me () {
    return this.#me;
  }

  set me (value) {
    this.#me = value;
  }

  get config () {
    return this.#config;
  }

  get utility () {
    return this.#utility;
  }

  get multimedia () {
    return this.#multimedia;
  }

  get websocket () {
    return this.#websocket;
  }

  get achievement () {
    return this.#achievement;
  }

  get audio () {
    return this.#audio;
  }

  get authorisation () {
    return this.#authorisation;
  }

  get banned () {
    return this.#banned;
  }

  get channel () {
    return this.#channel;
  }

  get charm () {
    return this.#charm;
  }

  get contact () {
    return this.#contact;
  }

  get event () {
    return this.#event;
  }

  get messaging () {
    return this.#messaging;
  }

  get notification () {
    return this.#notification;
  }

  get phrase () {
    return this.#phrase;
  }

  get user () {
    return this.#user;
  }

  get security () {
    return this.#security;
  }

  get store () {
    return this.#store;
  }

  get tip () {
    return this.#tip;
  }

  get topic () {
    return this.#topic;
  }

  get role () {
    return this.#role;
  }

  get metadata () {
    return this.#metadata;
  }

  get SPLIT_REGEX () {
    return /[\n\t,،\s+]/g;
  }

  login (email, password, apiKey, opts) {
    if (this.#loggedIn) { return; }

    // Assume Configuration
    if (email === undefined && password === undefined) {
      email = this.#config.framework.login?.email;
      password = this.#config.framework.login?.password;
      apiKey = this.#config.framework.login?.apiKey;

      opts = {
        token: this.#config.framework.login?.token,
        state: this.#config.framework.login?.onlineState,
        type: this.#config.framework.login?.type ?? 'email'
      };
    }

    this.#config.framework.login = {
      username: email,
      password,
      apiKey,
      token: opts?.token ?? `wjs-${nanoid()}`,
      state: opts?.onlineState ?? UserPresenceType.ONLINE,
      type: opts?.type ?? 'email'
    };

    // Validation
    return this.#websocket.connect();
  }
}

export default WOLF;
