/**
 * @param {import('../client/WOLF')} client
 */
class Base {
  constructor (client, defaultCacheValue = []) {
    this.client = client;
    this.cache = defaultCacheValue;
  }

  _patchIfExists (key, data) {
    if (Array.isArray(this.cache)) {
      const existing = this.cache.find((item) => item[key] === data[key]);

      if (existing) {
        this._patch(existing, data);
      }
    } else if (this.cache[data[key]]) {
      this._patch(data[key], data);
    }
  }

  _patch (oldData, newData) {
    for (const key in newData) {
      oldData[key] = newData[key];
    }
  }

  _clearCache () {
    this.cache = Array.isArray(this.cache) ? [] : {};
  }
}

export { Base };
