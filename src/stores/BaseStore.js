import Store from './Store.js';

class BaseStore {
  constructor (store = Map) {
    this.store = new Store(store);
  }
}

export default BaseStore;
