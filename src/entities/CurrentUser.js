
import FollowStore from '../caching/FollowStore.js';
import { User } from './user.js';

export default class CurrentUser extends User {
  #notificationStore;
  #followStore;

  constructor (client, entity) {
    super(client, entity);

    // this.#notificationStore = new NotificationStore();
    // this.#followStore = new FollowStore();
  }
}
