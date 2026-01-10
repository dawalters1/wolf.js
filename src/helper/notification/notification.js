import BaseHelper from '../baseHelper.js';
import NotificationGlobalHelper from './notificationGlobal.js';
import NotificationUserHelper from './notificationUser.js';

class NotificationHelper extends BaseHelper {
  #global;
  #user;
  constructor (client) {
    super(client);

    this.#global = new NotificationGlobalHelper(client);
    this.#user = new NotificationUserHelper(client);
  }

  get global () {
    return this.#global;
  }

  get user () {
    return this.#user;
  }
}

export default NotificationHelper;
