import Cache from './Cache.js';

export default class ChannelRoleStore {
  #roles;
  #users;
  constructor () {
    this.#roles = new Cache();
    this.#users = new Cache();
  }

  get roles () {
    return this.#roles;
  }

  get users () {
    return this.#users;
  }
}
