import BaseStore from './BaseStore.js';
class AuthorisationStore extends BaseStore {
  constructor () {
    super(Set);
  }

  has (id) {
    return this.store.has(id);
  }

  add (id) {
    return this.store.add(id);
  }

  delete (id) {
    return this.store.delete(id);
  }

  clear () {
    return this.store.clear();
  }
}

export default AuthorisationStore;
