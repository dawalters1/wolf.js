import CacheManager from '../stores_old/cacheManager.js';
import ExpiringProperty from '../stores_old/expiringProperty.js';
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
