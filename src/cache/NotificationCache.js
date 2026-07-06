import Cache from './Cache.js';

export default class NotificationCache {
  #global = new Cache();
  #user = new Cache();

  get global () {
    return this.#global;
  }

  get user () {
    return this.#user;
  }
}
