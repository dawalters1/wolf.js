import BaseStore from '../caching/BaseStore.js';

class BaseHelper {
  /**
   * @param {any} client
   */
  constructor (client) {
    this.client = client;

    this.store = new BaseStore();
  }

  resolveId (languageId, ids) {
    return Array.isArray(ids)
      ? ids.map((id) => `${languageId}-${id}`)
      : `${languageId}-${ids}`;
  }
}

export default BaseHelper;
