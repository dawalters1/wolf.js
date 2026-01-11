import Cache from './Cache.js';

export default class NotificationCache {
  #global;
  #user;
  constructor () {
    this.#global = new Cache();
    this.#user = new Cache();
  }

  get global () {
    return this.#global;
  }

  get user () {
    return this.#user;
  }
}
