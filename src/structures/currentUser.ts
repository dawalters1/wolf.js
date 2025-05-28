import WOLF from '../client/WOLF.ts';
import CacheManager from '../managers/cacheManager.ts';
import Notification from './notification.ts';
import { ServerUser, User } from './user.ts';

export class CurrentUser extends User {
  notificationsGlobal: CacheManager<Notification, Map<number, Notification>>;
  notificationsUser: CacheManager<Notification, Map<number, Notification>>;

  constructor (client: WOLF, data: ServerUser) {
    super(client, data);

    this.notificationsGlobal = new CacheManager(new Map());
    this.notificationsUser = new CacheManager(new Map());
  }
}

export default CurrentUser;
