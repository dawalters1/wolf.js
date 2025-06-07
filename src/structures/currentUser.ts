import CacheManager from '../managers/cacheManager.ts';
import Notification from './notification.ts';
import { ServerUser, User } from './user.ts';
import WOLF from '../client/WOLF.ts';

export class CurrentUser extends User {
  notificationsGlobal: CacheManager<Notification>;
  notificationsUser: CacheManager<Notification>;

  constructor (client: WOLF, data: ServerUser) {
    super(client, data);

    this.notificationsGlobal = new CacheManager();
    this.notificationsUser = new CacheManager();
  }

  patch (entity: any): this {
    return this;
  }
}

export default CurrentUser;
