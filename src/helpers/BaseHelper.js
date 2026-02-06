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
    if (value === null) { return false; }
    if (value === undefined) { return false; }

    return typeof value === 'object' && !Array.isArray(value);
  }

  normaliseNumber (num) {
    return Number(num) || num || null;
  }

  normaliseNumbers (ids) {
    if (this.isObject(ids)) { return ids; }

    return (Array.isArray(ids)
      ? ids
      : [ids]).map(
      (id) => this.normaliseNumber(id)
    );
  }

  normaliseArray (array) {
    return Array.isArray(array)
      ? array
      : [array];
  }

  normaliseFetchOpts (normalised, opts) {
    return this.isObject(normalised)
      ? normalised
      : opts;
  }

  resetStore () {
    this.store.clear();
  }
}
