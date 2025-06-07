import AchievementHelper from '../helper/achievement/achievement.ts';
import AudioHelper from '../helper/audio/audio';
import AuthorisationHelper from '../helper/authorisation/authorisation.ts';
import BannedHelper from '../helper/banned/banned.ts';
import ChannelHelper from '../helper/channel/channel.ts';
import CharmHelper from '../helper/charm/charm.ts';
import Contact from '../structures/contact';
import ContactHelper from '../helper/contact/contact.ts';
import CurrentUser from '../structures/currentUser.ts';
import EventEmitter from 'events';
import EventHelper from '../helper/event/event.ts';
import { Message } from '../structures/message';
import MessagingHelper from '../helper/messaging/messaging';
import Multimedia from './multimedia/multimedia.ts';
import { nanoid } from 'nanoid';
import Notification from '../structures/notification';
import NotificationHelper from '../helper/notification/notification.ts';
import { SessionContext } from './websocket/events/WELCOME';
import { User } from '../structures/user';
import UserHelper from '../helper/user/user.ts';
import { UserPresence } from '../constants';
import { Websocket } from './websocket/websocket.ts';
import Welcome from '../structures/welcome';
import WOLFResponse from '../structures/WOLFResponse';

// TODO: refactor event names
export interface Events {
  'ready': [],
  'loginSuccess': [SessionContext ],
  'resume': [SessionContext ],
  'loginFailed': [WOLFResponse],
  'welcome': [Welcome],
  'message': [Message],
  'channelMessage': [Message],
  'privateMessage': [Message],
  'blockAdd': [Contact],
  'globalNotificationAdd': [Notification],
  'globalNotificationClear': []
  'globalNotificationDelete': [number],
  'userNotificationAdd': [Notification],
  'userNotificationClear': []
  'userNotificationDelete': [number],
  'userProfileUpdate': [User, User]
}

class WOLF extends EventEmitter<Events> {
  config: any = {
    framework: {
      subscriptions: {
        channel: {
          list: true
        },
        notification: {
          global: true,
          user: true
        },
        messaging: {
          channel: true,
          private: true
        },
        tipping: {
          channel: false,
          private: false
        }
      },
      connection: {
        query: {
          device: 'wjs',
          version: undefined
        },
        host: 'https://v3-rc.palringo.com',
        port: 443
      }
    }
  };

  readonly multimedia: Multimedia;
  readonly achievement: AchievementHelper;
  readonly audio: AudioHelper;
  readonly authorisation: AuthorisationHelper;
  readonly banned: BannedHelper;
  readonly channel: ChannelHelper;
  readonly charm: CharmHelper;
  readonly contact: ContactHelper;
  readonly event: EventHelper;
  readonly messaging: MessagingHelper;
  readonly notification: NotificationHelper;
  readonly websocket: Websocket;
  readonly user: UserHelper;
  /** @internal */
  _me?: CurrentUser;
  loggedIn: boolean = false;

  get me () {
    return this._me as CurrentUser;
  }

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
    this.user = new UserHelper(this);
  }

  // Temp
  async login (email: string, password: string, v3Token?: string, developerToken?: string) {
    if (this.loggedIn) { return; }

    this.config = {
      ...this.config,
      framework: {
        ...this.config.framework,
        login: {
          username: email,
          password,
          token: v3Token ?? `wjs-${nanoid()}`,
          developerToken,
          state: UserPresence.AWAY
        }
      }
    };

    return this.websocket.connect();
  }
}

export default WOLF;
