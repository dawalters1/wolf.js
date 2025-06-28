import CacheManager from '../managers/cacheManager.js';
import { User } from './user.js';

export class CurrentUser extends User {
  constructor (client, entity) {
    super(client, entity);

    this.notificationsGlobal = new CacheManager();
    this.notificationsUser = new CacheManager();
  }
}

export default CurrentUser;
