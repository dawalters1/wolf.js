const Processor = require('./events/Processor');

class Websocket {
  constructor (api) {
    this.api = api;

    this._processor = new Processor(this.api);
  }
}

module.exports = Websocket;
