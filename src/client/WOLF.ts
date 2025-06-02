import AchievementHelper from '../helper/achievement/achievement.ts';
import AuthorisationHelper from '../helper/authorisation/authorisation.ts';
import BannedHelper from '../helper/banned/banned.ts';
import ChannelHelper from '../helper/channel/channel.ts';
import CharmHelper from '../helper/charm/charm.ts';
import ContactHelper from '../helper/contact/contact.ts';
import CurrentUser from '../structures/currentUser.ts';
import EventHelper from '../helper/event/event.ts';
import Multimedia from './multimedia/multimedia.ts';
import NotificationHelper from '../helper/notification/notification.ts';
import UserHelper from '../helper/user/user.ts';
import { Websocket } from './websocket/websocket.ts';

class WOLF {
  config: any;
  multimedia: Readonly<Multimedia>;
  achievement: Readonly<AchievementHelper>;
  authorisation: Readonly<AuthorisationHelper>;
  banned: Readonly<BannedHelper>;
  channel: Readonly<ChannelHelper>;
  charm: Readonly<CharmHelper>;
  contact: Readonly<ContactHelper>;
  event: Readonly<EventHelper>;
  notification: Readonly<NotificationHelper>;
  websocket: Readonly<Websocket>;
  user: Readonly<UserHelper>;
  me?: CurrentUser;

  constructor () {
    this.multimedia = new Multimedia(this);
    this.websocket = new Websocket(this);
    this.achievement = new AchievementHelper(this);
    this.authorisation = new AuthorisationHelper(this);
    this.banned = new BannedHelper(this);
    this.channel = new ChannelHelper(this);
    this.charm = new CharmHelper(this);
    this.contact = new ContactHelper(this);
    this.event = new EventHelper(this);
    this.notification = new NotificationHelper(this);
    this.user = new UserHelper(this);
  }
}

export default WOLF;
