
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
      transports: ['websocket'],
      reconnection: true
    });

    this.socket.on('connect', () => this._bot.on._emit('connect'));

    this.socket.on('connect_error', error => this._bot.on._emit('connect error', error));

    this.socket.on('connect_timeout', error => this._bot.on._emit('connect timeout', error));

    this.socket.on('disconnect', reason => {
      this._bot._cleanUp();
      this._bot.on._emit('disconnect', reason);
    });

    this.socket.on('error', error => this._bot.on._emit('error', error));

    this.socket.on('reconnecting', reconnectNumber => this._bot.on._emit('reconnecting', reconnectNumber));

    this.socket.on('reconnect', () => this._bot.on._emit('reconnect'));

    this.socket.on('reconnect_failed', error => this._bot.on._emit('reconnect failed', error));

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
        resolve(new Response(resp.code, resp.body, resp.headers, command));
      });
    });
  }
};
