const NodeCache = require('node-cache');

const FRAMEWORK_PREFIX = 'wjs.';

class Cache {
  constructor () {
    this._client = new NodeCache({ stdTTL: 0 });
  }

  setItem (key, value, ttl = undefined) {
    return this._client.set(`${FRAMEWORK_PREFIX}${key}`, JSON.stringify(value), ttl);
  }

  getItem (key) {
    const value = this._client.get(`${FRAMEWORK_PREFIX}${key}`);

    return value ? JSON.parse(value) : undefined;
  }

  delItem (key) {
    return this._client.del(`${FRAMEWORK_PREFIX}${key}`);
  }

  ttl (key) {
    return this._client.getTtl(`${FRAMEWORK_PREFIX}${key}`);
  }

  exists (key) {
    return this._client.has(`${FRAMEWORK_PREFIX}${key}`);
  }

  flush () {
    return this._client.flushAll();
  }
}

module.exports = Cache;
