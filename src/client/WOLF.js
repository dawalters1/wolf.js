import _ from 'lodash';
import AchievementHelper from '../helpers/achievement/Achievement.js';
import AudioHelper from '../helpers/audio/Audio.js';
import AuthorisationHelper from '../helpers/authorisation/Authorisation.js';
import BannedHelper from '../helpers/banned/Banned.js';
import ChannelHelper from '../helpers/channel/Channel.js';
import CharmHelper from '../helpers/charm/Charm.js';
import Command from '../commands/Command.js';
import CommandManager from '../commands/CommandManager.js';
import config from 'config';
import ContactHelper from '../helpers/contact/Contact.js';
import DiscoveryHelper from '../helpers/discovery/Discovery.js';
import { EventEmitter } from 'node:events';
import EventHelper from '../helpers/event/Event.js';
import ExperienceHelper from '../helpers/experience/Experience.js';
import { fileTypeFromBuffer } from 'file-type';
import { fileURLToPath } from 'node:url';
import FrameHelper from '../helpers/frame/Frame.js';
import fs from 'node:fs';
import { Gender, LookingFor, MessageFilterTierLevel, OnlineState, Relationship } from '../constants/index.js';
import Log from '../helpers/log/Log.js';
import MessageSetting from '../entities/MessageSetting.js';
import MessagingHelper from '../helpers/messaging/Messaging.js';
import Multimedia from './multimedia/Multimedia.js';
import { nanoid } from 'nanoid';
import NotificationHelper from '../helpers/notification/Notification.js';
import path, { dirname } from 'node:path';
import PhraseHelper from '../helpers/phrase/Phrase.js';
import PropertyCache from '../cache/PropertyCache.js';
import RoleHelper from '../helpers/role/Role.js';
import SecurityHelper from '../helpers/security/Security.js';
import StoreHelper from '../helpers/store/Store.js';
import TipHelper from '../helpers/tip/Tip.js';
import TopicHelper from '../helpers/topic/Topic.js';
import UserHelper from '../helpers/user/User.js';
import Utility from '../utilities/index.js';
import { validate, validateConfig } from '../validation/Validation.js';
import Websocket from './websocket/Websocket.js';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pick = (value, fallback = null) =>
  value !== undefined
    ? value
    : fallback;

const pickNumber = (value, fallback) =>
  value !== undefined
    ? Number(value)
    : fallback;

const getOrHas = (config, path, isHas = false) => {
  const result = path
    .split('.')
    .reduce((obj, key) => obj?.[key], config);

  if (isHas) { return result !== undefined; }

  if (result === undefined) {
    throw new Error(`Path "${path}" does not exist in config`);
  }

  return result;
};

export class WOLF extends EventEmitter {
  #achievement;
  #audio;
  #authorisation;
  #banned;
  #channel;
  #charm;
  #commandManager = undefined;
  #config;
  #contact;
  #discovery;
  #event;
  #experience;
  #frame;
  #log;
  #loggedIn = false;
  #me = undefined;
  #messageSettings = new PropertyCache({ ttl: 60 });
  #messaging;
  #metadata;
  #multimedia;
  #notification;
  #phrase;
  #role;
  #security;
  #store;
  #tip;
  #topic;
  #user;
  #utility;
  #websocket;

  constructor (opts) {
    super();

    const baseConfig = config.util.toObject();

    const frameworkConfig = yaml.load(
      fs.readFileSync(path.join(__dirname, '../../config/default.yaml'), 'utf-8')
    );

    const botConfigPath = path.join(process.cwd(), `${opts?.paths?.configDir ?? '/config'}/default.yaml`);
    const botConfig = fs.existsSync(botConfigPath)
      ? yaml.load(fs.readFileSync(botConfigPath, 'utf-8'))
      : {};

    this.#config = _.merge(baseConfig, frameworkConfig, botConfig);
    this.#config.get = (path) => getOrHas(this.config, path, false);
    this.#config.has = (property) => getOrHas(this.config, property, true);

    this.#log = new Log(this, opts?.winston);// eslint-disable-line custom/auto-sort-private-properties-and-getters

    this.#utility = new Utility(this);

    this.#achievement = new AchievementHelper(this);
    this.#audio = new AudioHelper(this);
    this.#authorisation = new AuthorisationHelper(this);
    this.#banned = new BannedHelper(this);
    this.#channel = new ChannelHelper(this);
    this.#charm = new CharmHelper(this);
    this.#contact = new ContactHelper(this);
    this.#discovery = new DiscoveryHelper(this);
    this.#event = new EventHelper(this);
    this.#experience = new ExperienceHelper(this);
    this.#frame = new FrameHelper(this);
    this.#messaging = new MessagingHelper(this);
    this.#multimedia = new Multimedia(this);
    this.#notification = new NotificationHelper(this);
    this.#phrase = new PhraseHelper(this, opts?.phrasesDir);
    this.#role = new RoleHelper(this);
    this.#security = new SecurityHelper(this);
    this.#store = new StoreHelper(this);
    this.#tip = new TipHelper(this);
    this.#topic = new TopicHelper(this);
    this.#user = new UserHelper(this);
    this.#websocket = new Websocket(this);
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

  /** @internal */
  set me (value) {
    this.#me = value;
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

  get config () {
    return this.#config;
  }

  get contact () {
    return this.#contact;
  }

  get discovery () {
    return this.#discovery;
  }

  get event () {
    return this.#event;
  }

  get experience () {
    return this.#experience;
  }

  get frame () {
    return this.#frame;
  }

  get log () {
    return this.#log;
  }

  get messaging () {
    return this.#messaging;
  }

  get metadata () {
    return this.#metadata;
  }

  get multimedia () {
    return this.#multimedia;
  }

  get notification () {
    return this.#notification;
  }

  get phrase () {
    return this.#phrase;
  }

  get role () {
    return this.#role;
  }

  get security () {
    return this.#security;
  }

  get SPLIT_REGEX () {
    return /[\n\t,،\s+]/g;
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

  get user () {
    return this.#user;
  }

  get utility () {
    return this.#utility;
  }

  get websocket () {
    return this.#websocket;
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
        state: this.#config.framework.login?.onlineState
      };
    }

    this.#config.framework.login = {
      username: email,
      password,
      apiKey,
      token: opts?.token ?? `wjs-${nanoid()}`,
      state: opts?.onlineState ?? OnlineState.ONLINE
    };

    return this.#websocket.connect();
  }

  logout () {
    return this.#security.logout();
  }

  async update (profile, avatar) {
    const avatarConfig = this.config.framework.multimedia.avatar.user;

    validate(profile, this, this.update)
      .isNotRequired()
      .forEachProperty(
        {
          nickname: validator => validator
            .isNotRequired()
            .isString()
            .isNotWhitespace(),
          status: validator => validator
            .isNotRequired()
            .isBoolean(),

          extended: validator => validator
            .isNotRequired()
            .forEachProperty(
              {
                about: validator => validator
                  .isNotRequired()
                  .isString()
                  .isNotWhitespace(),
                name: validator => validator
                  .isNotRequired()
                  .isString()
                  .isNotWhitespace(),
                urls: validator => validator
                  .isNotRequired()
                  .isArray()
                  .each()
                  .isString()
                  .isNotWhitespace(),
                dateOfBirth: validator => validator
                  .isNotRequired()
                  .isValidDate(),
                gender: validator => validator
                  .isNotRequired()
                  .in(Object.values(Gender)),
                lookingFor: validator => validator
                  .isNotRequired()
                  .in(Object.values(LookingFor)),
                relationship: validator => validator
                  .isNotRequired()
                  .in(Object.values(Relationship))
              }
            )
        }
      );

    validate(avatar, this, this.update)
      .isNotRequired()
      .isBuffer();

    if (!profile && !avatar) { throw new Error('You must provide a profile and/or avatar you want to update'); }

    if (avatar) {
      await validateConfig(avatar, avatarConfig, this.me, this, this.update);
    }

    const uploadAvatar = async () => {
      return this.multimedia.post(avatarConfig, {
        data: avatar.toString('base64'),
        mimeType: (await fileTypeFromBuffer(avatar)).mime,
        id: this.me.id,
        source: this.me.id
      });
    };

    if (profile === null) {
      return uploadAvatar();
    }

    const response = await this.websocket.emit(
      'subscriber profile update',
      {
        id: this.me.id,
        nickname: pick(profile.nickname, this.me.nickname),
        status: pick(profile.status, this.me.status),

        extended: {
          dateOfBirth: pick(profile.extend.dateOfBirth, this.me.extended.dateOfBirth),
          about: pick(profile.extend.about, this.me.extended.about),
          gender: pickNumber(profile.extend.gender, this.me.extended.gender),
          language: pickNumber(profile.extend.language, this.me.extended.language),
          lookingFor: pickNumber(profile.extend.lookingFor, this.me.extended.lookingFor),
          name: pick(profile.extend.name, this.me.extended.name),
          relationship: pickNumber(profile.extend.relationship, this.me.extended.relationship),
          urls: pick(profile.extend.urls, this.me.extended.urls)
        }
      }
    );

    if (response.success && avatar) {
      response.body.avatarResponse = await uploadAvatar();
    }

    return response;
  }

  async messageSettings (opts) {
    validate(opts, this, this.messageSettings)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    if (!opts?.forceNew && this.#messageSettings.fetched) {
      return this.#messageSettings.value;
    }

    const response = await this.websocket.emit('message setting');

    this.#messageSettings.value = new MessageSetting(this, response.body);

    return this.#messageSettings.value;
  }

  async updateMessageSettings (messageFilterTier) {
    validate(messageFilterTier, this, this.updateMessageSettings)
      .isNotNullOrUndefined()
      .in(Object.values(MessageFilterTierLevel));

    return await this.websocket.emit(
      'message setting update',
      {
        spamFilter: {
          enabled: messageFilterTier !== MessageFilterTierLevel.OFF,
          tier: messageFilterTier
        }
      }
    );
  }
}

export default WOLF;
