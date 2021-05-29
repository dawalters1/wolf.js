
const io = require('socket.io-client');
const internal = require('../constants/internal');
const Response = require('./Response');

module.exports = class WolfClient {
  constructor (bot) {
    this._bot = bot;
    this._config = this._bot.config;

    this.host = 'https://v3-rc.palringo.com';
    this.port = 3051;
  };

  create () {
    this.socket = io(`${this.host}:${this.port}/?token=${this._bot.config.options.token}&device=${this._bot.config.app.loginSettings.loginDevice}`, {
      transports: ['websocket']
    });

    this.socket.on(internal.CONNECTED, () => this._bot.on._emit(internal.CONNECTED));

    this.socket.on(internal.CONNECTION_ERROR, error => this._bot.on._emit(internal.CONNECTION_ERROR, error));

    this.socket.on(internal.DISCONNECTED, reason => {
      this._bot._cleanUp();
      this._bot.on._emit(internal.DISCONNECTED, reason);
    });

    this.socket.on(internal.ERROR, error => this._bot.on._emit(internal.ERROR, error));

    this.socket.on(internal.RECONNECTING, reconnectNumber => this._bot.on._emit(internal.RECONNECTING, reconnectNumber));

    const patch = require('socketio-wildcard')(io.Manager);
    patch(this.socket);

    this.socket.on('*', packet => {
      const eventString = packet.data[0];
      const data = packet.data[1];

      const handler = this._bot._eventManager._handlers[eventString];

      if (handler) {
        handler.process(data.body ? data.body : data);
      }

      this._bot.on._emit(internal.PACKET_RECEIVED, eventString, data);

      return Promise.resolve();
    });
  }

  emit (command, data) {
    if (data && !data.body && !data.headers) {
      data = {
        body: data
      };
    }
    return new Promise((resolve, reject) => {
      this._bot.on._emit(internal.PACKET_SENT, command, data);

      this.socket.emit(command, data, resp => {
        resolve(new Response(resp.code, resp.body, resp.headers));
      });
    });
  }
};
