import BaseExpireProperty from '../caching/BaseExpireProperty.js';
import BaseStore from '../caching/BaseStore.js';
import FollowStore from '../caching/FollowStore.js';
import NotificationStore from '../caching/NotificationStore.js';
import { User } from './user.js';

export class CurrentUser extends User {
  // === Private store fields ===
  #notificationStore;
  #followStore;

  constructor (client, entity) {
    super(client, entity);

    this.#notificationStore = new NotificationStore();
    this.#followStore = new FollowStore();
  }

  /** @internal */
  get notificationStore () {
    return this.#notificationStore;
  }

  /** @internal */
  get followStore () {
    return this.#followStore;
  }
}

export default CurrentUser;
