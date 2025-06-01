import AchievementHelper from '../helper/achievement/achievement.ts';
import AuthorisationHelper from '../helper/authorisation/authorisation.ts';
import BannedHelper from '../helper/banned/banned.ts';
import ChannelHelper from '../helper/channel/channel.ts';
import CurrentUser from '../structures/currentUser.ts';
import EventHelper from '../helper/event/event.ts';
import Multimedia from './multimedia/multimedia.ts';
import { UserHelper } from '../helper/user/userHelper.ts';
import { Websocket } from './websocket/websocket.ts';

class WOLF {
  config: any;
  multimedia: Multimedia;
  achievement: Readonly<AchievementHelper>;
  authorisation: AuthorisationHelper;
  banned: BannedHelper;
  // user: User;
  channel: Readonly<ChannelHelper>;
  event: Readonly<EventHelper>;
  websocket: Websocket;
  user: UserHelper;
  me?: CurrentUser;

  constructor () {
    this.multimedia = new Multimedia(this);
    this.websocket = new Websocket(this);
    this.achievement = new AchievementHelper(this);
    this.user = new UserHelper(this);
    this.authorisation = new AuthorisationHelper(this);
    this.banned = new BannedHelper(this);
    this.channel = new ChannelHelper(this);
    this.event = new EventHelper(this);
  }
}

export default WOLF;
