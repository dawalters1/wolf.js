
const io = require('socket.io-client');
const internal = require('../constants/internal');
const Response = require('./Response');

// These events are ignored because I manually handle them via on MESSAGE_SEND

const ignoreEvents = [
  'group member add',
  'group member delete',
  'group member update'
];

/**
 * {@hideconstructor}
 */
module.exports = class Websocket {
  constructor (api) {
    this._api = api;
  };

  create () {
    this.socket = io(`${this._api._botConfig.endpoint.host}:${this._api._botConfig.endpoint.port}/?token=${this._api.config._loginSettings.token}&device=${this._api.config._loginSettings.loginDevice}`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000,
      reconnectionAttempts: Infinity
    });

    this.socket.on('connect', () => this._api.on._emit('connect'));

    this.socket.on('connect_error', error => this._api.on._emit('connect error', error));

    this.socket.on('connect_timeout', error => this._api.on._emit('connect timeout', error));

    this.socket.on('disconnect', reason => {
      this._api._clearCache();
      this._api.on._emit('disconnect', reason);
      // Socket doesnt reconnect on io server disconnect, manually reconnect
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('error', error => this._api.on._emit('error', error));

    this.socket.on('reconnecting', reconnectNumber => this._api.on._emit('reconnecting', reconnectNumber));

    this.socket.on('reconnect', () => this._api.on._emit('reconnect'));

    this.socket.on('reconnect_failed', error => this._api.on._emit('reconnect failed', error));

    const patch = require('socketio-wildcard')(io.Manager);
    patch(this.socket);

    this.socket.on('*', packet => {
      const eventString = packet.data[0];

      const data = packet.data[1];

      const handler = this._api._eventManager._handlers[eventString];

      if (!ignoreEvents.includes(eventString)) {
        if (handler) {
          handler.process(data.body ? data.body : data);
        } else {
          this._api.on._emit(internal.INTERNAL_ERROR, `Unhandled socket event: ${eventString}`);
        }

        this._api.on._emit(internal.PACKET_RECEIVED, eventString, data);
      }
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
      this._api.on._emit(internal.PACKET_SENT, command, data);

      this.socket.emit(command, data, resp => {
        resolve(new Response(resp.code, resp.body, resp.headers, command));
      });
    });
  }
};
