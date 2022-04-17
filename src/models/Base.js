
class Base {
  constructor (api) {
    this.api = api;
  }

  _patch (data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
}

module.exports = Base;
