const Processor = require('./events/Processor');

class Websocket {
  constructor (client) {
    this.client = client;

    this._processor = new Processor(this.client);
  }
}

module.exports = Websocket;
