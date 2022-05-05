const Cache = require('../cache');

class Base {
  constructor (client, key = undefined) {
    this.client = client;

    this.cache = new Cache(key);
  }
}

module.exports = Base;
