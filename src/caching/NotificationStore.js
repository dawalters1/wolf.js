import BaseStore from './BaseStore.js';

class NotificationStore {
  constructor () {
    this.global = new BaseStore();
    this.user = new BaseStore();
  }

  // TODO:
}

export default NotificationStore;
