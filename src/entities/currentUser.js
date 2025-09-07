import CacheManager from '../stores/cacheManager.js';
import ExpiringProperty from '../stores/expiringProperty.js';
import { User } from './user.js';

export class CurrentUser extends User {
  constructor (client, entity) {
    super(client, entity);

    this.notificationsGlobal = new CacheManager();
    this.notificationsUser = new CacheManager();

    this._follow = {
      followers: {
        count: new ExpiringProperty(15),
***REMOVED*** new CacheManager(120)
      },
      following: {
        count: new ExpiringProperty(15),
***REMOVED*** new CacheManager(3600)
      }
    };
  }
}

export default CurrentUser;
