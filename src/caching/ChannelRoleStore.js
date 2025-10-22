import BaseStore from './BaseStore.js';

class ChannelRoleStore {
  constructor () {
    this.users = new BaseStore();
    this.roles = new BaseStore();
  }
}

export default ChannelRoleStore;
