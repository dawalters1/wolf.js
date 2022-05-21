
class Base {
  constructor (client, defaultCacheValue = []) {
    this.client = client;
    this.cache = defaultCacheValue;
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

module.exports = Base;
