
module.exports = class Helper {
  constructor (bot) {
    this._bot = bot;
    this._config = this._bot.config;
    this._websocket = this._bot.websocket;
    this._cache = [];
  }

  _cleanUp () {
    if (this._cache) {
      this._cache = [];
    }
  }
};
