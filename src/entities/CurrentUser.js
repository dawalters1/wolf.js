
// import FollowStore from '../caching/FollowStore.js';
import NotificationCache from '../cache/NotificationCache.js';
import User from './User.js';

export default class CurrentUser extends User {
  #notificationStore;
  #followStore;

  constructor (client, entity) {
    super(client, entity);

    this.#notificationStore = new NotificationCache();
    // this.#followStore = new FollowStore();
  }

  get notificationStore () {
    return this.#notificationStore;
  }
}
