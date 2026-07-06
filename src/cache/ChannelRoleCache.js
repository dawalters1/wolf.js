import Cache from './Cache.js';

export default class ChannelRoleStore {
  #roles = new Cache();
  #users = new Cache();

  get roles () {
    return this.#roles;
  }

  get users () {
    return this.#users;
  }
}
