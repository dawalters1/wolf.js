import Cache from './Cache.js';

export default class ChannelRoleStore {
  #users;
  #roles;
  constructor () {
    this.#users = new Cache();
    this.#roles = new Cache();
  }

  get users () {
    return this.#users;
  }

  get roles () {
    return this.#roles;
  }
}
