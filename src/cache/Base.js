import CacheType from '../constants/CacheType.js';
import { patch } from '../utils';

class Base {
  constructor (type) {
    this.type = type;
    this.cache = type === CacheType.ARRAY ? [] : {};
  }

  /**
   *
   * @param {Object|Object[]|String|Number|Boolean} value
   * @param {*} key
   * @returns
   */
  add (value, key) {
    const items = Array.isArray(value) ? value : [value];

    const results = items.map((item) => {
      const existing = this.type === CacheType.ARRAY
        ? this.cache.find((cached) => key ? cached[key] === item[key] : cached === item)
        : this.cache[key] === item[key];

      if (existing) {
        patch(existing, item);
      } else if (this.type === CacheType.ARRAY) {
        this.cache.push(item);
      } else {
        this.cache[key] = item;
      }

      return item;
    });

    return Array.isArray(value) ? results : results[0];
  }

  remove (value, key) {
    const items = Array.isArray(value) ? value : [value];

    const results = items.map((item) => {
      const existing = this.type === CacheType.ARRAY
        ? this.cache.find((cached) => key ? cached[key] === item[key] : cached === item)
        : this.cache[key] === item[key];

      if (!existing) {
        return false;
      } else if (this.type === CacheType.ARRAY) {
        this.cache = this.cache.filter((cached) => key ? cached[key] !== item[key] : cached === item);
      } else {
        Reflect.deleteProperty(this.cache, item[key]);
      }

      return true;
    });

    return Array.isArray(value) ? results : results[0];
  }

  clear () {
    this.cache = this.type === CacheType.ARRAY ? [] : {};
  }

  get (value, key) {
    const items = Array.isArray(value) ? value : [value];

    const results = items.map((item) =>
      (
        this.type === CacheType.ARRAY
          ? this.cache.find((cached) => key ? cached[key] === item[key] : cached === item)
          : this.cache[key] === item[key]
      ) ||
      null
    );

    return Array.isArray(value) ? results : results[0];
  }
}

export default Base;
