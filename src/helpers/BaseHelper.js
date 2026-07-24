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
    if (num === undefined) { return undefined; }

    return Number(num) || num;
  }

  normaliseNumbers (ids) {
    if (ids === undefined) { return undefined; }
    if (this.isObject(ids)) { return ids; }

    return (Array.isArray(ids)
      ? ids
      : [ids]).map(
      (id) => this.normaliseNumber(id)
    );
  }

  normaliseArray (array) {
    if (array === undefined) { return undefined; }
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

  pick (value, fallback = null) {
    return value !== undefined
      ? value
      : fallback;
  }

  pickNumber (value, fallback) {
    return value !== undefined
      ? Number(value)
      : fallback;
  }
}
