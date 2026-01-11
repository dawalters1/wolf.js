import Cache from '../cache/Cache.js';

export default class BaseHelper {
  #client;
  #store;

  constructor (client, cacheOptions = {}) {
    this.#client = client;
    this.#store = new Cache(cacheOptions);
  }

  get client () {
    return this.#client;
  }

  get store () {
    return this.#store;
  }

  isObject (value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  normaliseNumber (num) {
    return Number(num) || num || null;
  }

  normaliseNumbers (ids) {
    return (Array.isArray(ids)
      ? ids
      : [ids]).map(
      (id) => this.normaliseNumber(id)
    );
  }
}
