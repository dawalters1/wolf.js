import AchievementHelper from '../helper/achievement/achievement.ts';
import AudioHelper from '../helper/audio/audio';
import AuthorisationHelper from '../helper/authorisation/authorisation.ts';
import BannedHelper from '../helper/banned/banned.ts';
import Channel from '../structures/channel';
import ChannelAudioCount from '../structures/channelAudioCount';
import { ChannelAudioSlot } from '../structures/channelAudioSlot';
import ChannelAudioSlotRequest from '../structures/channelAudioSlotRequest';
import ChannelHelper from '../helper/channel/channel.ts';
import ChannelRoleUser from '../structures/channelRoleUser';
import CharmHelper from '../helper/charm/charm.ts';
import Contact from '../structures/contact';
import ContactHelper from '../helper/contact/contact.ts';
import CurrentUser from '../structures/currentUser.ts';
import { EventEmitter } from 'events';
import EventHelper from '../helper/event/event.ts';
import EventSubscription from '../structures/eventSubscription';
import { Message } from '../structures/message';
import MessagingHelper from '../helper/messaging/messaging';
import Multimedia from './multimedia/multimedia.ts';
import { nanoid } from 'nanoid';
import Notification from '../structures/notification';
import NotificationHelper from '../helper/notification/notification.ts';
import RoleHelper from '../helper/role/role';
import { SessionContext } from './websocket/events/WELCOME';
import TipHelper from '../helper/tip/tip';
import { User } from '../structures/user';
import UserHelper from '../helper/user/user.ts';
import UserPresence from '../structures/userPresence';
import { UserPresence as UserPresenceType } from '../constants';
import { Websocket } from './websocket/websocket.ts';
import Welcome from '../structures/welcome';
import WOLFResponse from '../structures/WOLFResponse';

export type Events = {
  ready: [],
  loginSuccess: [sessionContext: SessionContext],
  resume: [sessionContext: SessionContext],
  loginFailed: [wolfResponse: WOLFResponse],
  welcome: [welcome: Welcome],
  message: [message: Message],
  channelMessage: [message: Message],
  privateMessage: [message: Message],
  blockAdd: [contact: Contact],
  globalNotificationAdd: [notification: Notification],
  globalNotificationClear: [],
  globalNotificationDelete: [notificationId: number],
  userNotificationAdd: [notification: Notification],
  userNotificationClear: [],
  userNotificationDelete: [notificationId: number],
  userProfileUpdate: [oldUser: User, newUser: User],
  userPresenceUpdate: [userPresence: UserPresence],
  channelProfileUpdate: [oldChannel: Channel, newChannel: Channel],
  contactAdd: [contact: Contact],
  contactDelete: [userId: number],
  blockDelete: [userId: number],
  userChannelEventSubscriptionAdd: [eventSubscription: EventSubscription],
  userChannelEventSubscriptionDelete: [eventId: number],
  channelAudioSlotRequestClear: [],
  channelAudioSlotRequestAdd: [channelAudioSlotRequest: ChannelAudioSlotRequest],
  channelAudioSlotRequestDelete: [slotId: number],
  channelRoleUserAssign: [channelRoleUser: ChannelRoleUser],
  channelRoleUserUnassign: [channelId: number, userId: number],
  channelAudioCountUpdate: [oldCount: ChannelAudioCount, newCount: ChannelAudioCount],
  channelAudioSlotUpdate: [oldSlot: ChannelAudioSlot, newSlot: ChannelAudioSlot]
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
  readonly tip: TipHelper;
  readonly role: RoleHelper;

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
    this.tip = new TipHelper(this);
    this.role = new RoleHelper(this);
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
          state: UserPresenceType.AWAY
        }
      }
    };

    return this.websocket.connect();
  }
}

export default WOLF;
