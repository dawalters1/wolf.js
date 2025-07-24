import CacheManager from '../managers/cacheManager.js';
import ExpiringProperty from '../managers/expiringProperty.js';
import { User } from './user.js';

export class CurrentUser extends User {
  constructor (client, entity) {
    super(client, entity);

    this.notificationsGlobal = new CacheManager();
    this.notificationsUser = new CacheManager();

    this._follow = {
      followers: {
        count: new ExpiringProperty(15),
        list: new CacheManager(120)
      },
      following: {
        count: new ExpiringProperty(15),
        list: new CacheManager(3600)
      }
    };
  }
}

export default CurrentUser;
