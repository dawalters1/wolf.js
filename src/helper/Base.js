
class Base {
  constructor (client) {
    this.client = client;
  }

  patch (oldData, newData) {
    for (const key in newData) {
      oldData[key] = newData[key];
    }
  }
}

module.exports = Base;
