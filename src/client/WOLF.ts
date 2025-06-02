import AchievementHelper from '../helper/achievement/achievement.ts';
import AudioHelper from '../helper/audio/audio';
import AuthorisationHelper from '../helper/authorisation/authorisation.ts';
import BannedHelper from '../helper/banned/banned.ts';
import ChannelHelper from '../helper/channel/channel.ts';
import CharmHelper from '../helper/charm/charm.ts';
import ContactHelper from '../helper/contact/contact.ts';
import CurrentUser from '../structures/currentUser.ts';
import EventHelper from '../helper/event/event.ts';
import Multimedia from './multimedia/multimedia.ts';
import { nanoid } from 'nanoid';
import NotificationHelper from '../helper/notification/notification.ts';
import UserHelper from '../helper/user/user.ts';
import { UserPresence } from '../constants';
import { Websocket } from './websocket/websocket.ts';

class WOLF {
  config: any = {
    framework: {
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
  readonly notification: NotificationHelper;
  readonly websocket: Websocket;
  readonly user: UserHelper;
  me?: CurrentUser;
  loggedIn: boolean = false;

  constructor () {
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
          email,
          password,
          token: v3Token ?? `wjs-${nanoid()}`,
          developerToken,
          onlineState: UserPresence.AWAY
        }
      }
    };

    return this.websocket.connect();
  }
}

export default WOLF;
