
import BaseExpireProperty from '../caching/BaseExpireProperty.js';
import BaseStore from '../caching/BaseStore.js';
import FollowStore from '../caching/FollowStore.js';
import NotificationStore from '../caching/NotificationStore.js';
import { User } from './user.js';

export class CurrentUser extends User {
  constructor (client, entity) {
    super(client, entity);

    this._notifications = new NotificationStore();
    this._follow = new FollowStore();
  }
}

export default CurrentUser;
