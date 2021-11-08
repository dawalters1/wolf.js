const NodeCache = require('node-cache');
const EventEmitter = require('events').EventEmitter;

/**
 * @private
 * @hideconstructor
 */

// Potentially use this? Unsure yet.

class Cache extends EventEmitter {
  constructor () {
    super();

    this._client = new NodeCache();
  }

  async _getItem (key) {
    return new Promise((resolve, reject) => {
      this._client.get(
        key,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  async _setItem (key, value, ttl = undefined) {
    if (ttl !== undefined) {
      return new Promise((resolve, reject) => {
        this._client.set(
          key,
          value,
          ttl,
          (error, results) => ((error) ? reject(error) : resolve(results))
        );
      });
    }
    return new Promise((resolve, reject) => {
      this._client.set(
        key,
        value,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  async _delItem (key) {
    return new Promise((resolve, reject) => {
      this._client.del(
        key,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  async _exists (key) {
    return new Promise((resolve, reject) => {
      this._client.has(
        key,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  async _getTTL (key) {
    return new Promise((resolve, reject) => {
      this._client.getTtl(
        key,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  async _expire (key, ttl) {
    return new Promise((resolve, reject) => {
      this._client.ttl(
        key,
        ttl,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  async getGroup (id) {
    return JSON.parse(this._getItem());
  }
}

module.exports = Cache;
