import AchievementHelper from '../helper/achievement/achievement.js';
import AudioHelper from '../helper/audio/audio.js';
import AuthorisationHelper from '../helper/authorisation/authorisation.js';
import BannedHelper from '../helper/banned/banned.js';
import ChannelHelper from '../helper/channel/channel.js';
import CharmHelper from '../helper/charm/charm.js';
import ContactHelper from '../helper/contact/contact.js';
import { EventEmitter } from 'node:events';
import EventHelper from '../helper/event/event.js';
import MessagingHelper from '../helper/messaging/messaging.js';
import MetadataHelper from '../helper/metadata/metadata.js';
import Multimedia from './multimedia/multimedia.js';
import { nanoid } from 'nanoid';
import NotificationHelper from '../helper/notification/notification.js';
import PhraseHelper from '../helper/phrase/phrase.js';
import RoleHelper from '../helper/role/role.js';
import TipHelper from '../helper/tip/tip.js';
import UserHelper from '../helper/user/user.js';
import { UserPresence as UserPresenceType } from '../constants/index.js';
import { Websocket } from './websocket/websocket.js';

class WOLF extends EventEmitter {
  config = {
    framework: {
      subscriptions: {
        channel: { list: true },
        notification: { global: true, user: true },
        messaging: { channel: true, private: true },
        tipping: { channel: false, private: false }
      },
      connection: {
        query: {
          device: 'wjs',
          version: undefined
        },
        host: 'https://v3-rc.palringo.com',
        port: 443
      },
      commands: {
        phrases: {
          enabled: false
        },
        ignore: {
          self: true,
          official: true,
          unofficial: false
        }
      }
    }
  };

  loggedIn = false;
  _me = undefined;

  constructor () {
    super();

    this.multimedia = new Multimedia(this);
    this.websocket = new Websocket(this);
    this.achievement = new AchievementHelper(this);
    this.audio = new AudioHelper(this);
    this.authorisation = new AuthorisationHelper(this);
    this.banned = new BannedHelper(this);
    this.channel = new ChannelHelper(this);
    this.charm = new CharmHelper(this);
    this.contact = new ContactHelper(this);
    this.event = new EventHelper(this);
    this.messaging = new MessagingHelper(this);
    this.notification = new NotificationHelper(this);
    this.phrase = new PhraseHelper(this);
    this.user = new UserHelper(this);
    this.tip = new TipHelper(this);
    this.role = new RoleHelper(this);
    this.metadata = new MetadataHelper(this);
  }

  get me () {
    return this._me;
  }

  get SPLIT_REGEX () {
    return /[\n\t,،\s+]/g;
  }

  async login (email, password, v3Token, apiKey) {
    if (this.loggedIn) { return; }

    this.config = {
      ...this.config,
      framework: {
        ...this.config.framework,
        login: {
          username: email,
          password,
          token: v3Token ?? `wjs-${nanoid()}`,
          apiKey,
          state: UserPresenceType.AWAY
        }
      }
    };

    return this.websocket.connect();
  }
}

export default WOLF;
