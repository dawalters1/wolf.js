import Store from "../stores_old/Store.js";

class BaseHelper {
  /**
   * @param {any} client
   * @param {import('../stores_old/Store.js').default} store
   */
  constructor (client, store) {
    this.client = client;

    this.store = new store()
  }
}

export default BaseHelper;
