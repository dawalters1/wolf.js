import BaseHelper from '../BaseHelper.js';
import NotificationGlobalHelper from './NotificationGlobal.js';
import NotificationUserHelper from './NotificationUser.js';

export default class NotificationHelper extends BaseHelper {
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
