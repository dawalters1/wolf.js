class Base {
  constructor (client) {
    this.client = client;
  }

  _patch (data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
}

module.exports = Base;
