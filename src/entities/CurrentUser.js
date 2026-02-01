
// import FollowStore from '../caching/FollowStore.js';
import NotificationCache from '../cache/NotificationCache.js';
import User from './User.js';

export default class CurrentUser extends User {
  #notificationStore;

  constructor (client, entity) {
    super(client, entity);

    this.#notificationStore = new NotificationCache();
  }

  get notificationStore () {
    return this.#notificationStore;
  }
}
