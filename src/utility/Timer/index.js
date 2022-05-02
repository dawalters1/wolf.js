
class Timer {
  constructor (client) {
    this.client = client;

    this._handlers = {};
  }
}

module.exports = Timer;
