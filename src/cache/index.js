
const patch = (oldData, newData) => {
  for (const key in newData) {
    oldData[key] = newData[key];
  }
};

/**
 * Caching module
 * If key is not null array holds objects
 * If key is null array holds number, string, boolean, etc
 */
class Cache {
  constructor (key = undefined) {
    this.key = key;
    this.cache = [];
  }

  any () {
    return this.cache.length > 0;
  }

  list () {
    return this.cache;
  }

  clear () {
    this.cache = [];
  }

  exists (item) {
    return this.key ? this.cache.find((itm) => itm[this.key] === item) !== undefined : this.cache.includes(item);
  }

  add (value) {
    for (const item of (Array.isArray(value) ? value : [value])) {
      if (!this.key) {
        this.cache.push(item);
      } else {
        const existing = this.cache.find((itm) => itm[this.key] === item[this.key]);

        if (existing) {
          patch(existing, item);
        } else {
          this.cache.push(item);
        }
      }
    }
    return value;
  }

  remove (value) {
    return this.cache.slice(this.cache.findIndex((itm) => this.key ? (itm[this.key] === value[this.key]) : (itm === value)), 1);
  }

  get (value) {
    const items = (Array.isArray(value) ? value : [value]).reduce((result, item) => {
      if (this.exists(item)) {
        result.push(this.key ? this.cache.find((itm) => itm[this.key] === item) : item);
      }

      return result;
    }, []);

    return Array.isArray(value) ? items : items[0];
  }
}

module.exports = Cache;
