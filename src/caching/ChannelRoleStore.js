import BaseStore from './BaseStore.js';

class ChannelRoleStore {
  constructor () {
    this.summaries = new BaseStore();
    this.roles = new BaseStore();
  }
}

export default ChannelRoleStore;
