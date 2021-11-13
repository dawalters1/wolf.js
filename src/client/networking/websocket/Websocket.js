const Handler = require('./handlers');
const Response = require('../../../models/ResponseObject');

const io = require('socket.io-client');
const { events, retryMode } = require('../../../constants');

/**
 * {@hideconstructor}
 */
module.exports = class Websocket {
  constructor (api) {
    this._api = api;
    this._handler = new Handler(this._api);

    // TODO: prevent duplicate requests with the use of defs
  };

  _init () {
    this.socket = io(`${this._api._botConfig.connection.host}:${this._api._botConfig.connection.port}/?token=${this._api.config._loginSettings.token}&device=${this._api.config._loginSettings.loginDevice}`,
      {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 3000,
        reconnectionAttempts: Infinity
      }
    );

    this.socket.on('connect', () => this._api.emit(events.CONNECTED));

    this.socket.on('connect_error', error => this._api.emit(events.CONNECTION_ERROR, error));

    this.socket.on('connect_timeout', error => this._api.emit(events.CONNECTION_TIMEOUT, error));

    this.socket.on('disconnect', reason => {
      this._api.cleanup();

      this._api.emit(events.DISCONNECTED, reason);
      // Socket doesnt reconnect on io server disconnect, manually reconnect
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('error', error => this._api.emit(events.ERROR, error));

    this.socket.on('reconnecting', reconnectNumber => this._api.emit(events.RECONNECTING, reconnectNumber));

    this.socket.on('reconnect', () => this._api.emit(events.RECONNECTED));

    this.socket.on('reconnect_failed', error => this._api.emit(events.RECONNECT_FAILED, error));

    this.socket.on('ping', () => this._api.emit(events.PING));
    this.socket.on('pong', (latency) => this._api.emit(events.PONG, latency));

    const patch = require('socketio-wildcard')(io.Manager);
    patch(this.socket);

    this.socket.on('*', packet => {
      this._handler.handle(packet.data);
    });
  }

  async _emit (command, data, attempt = 1) {
    if (data && !data.body && !data.headers) {
      data = {
        body: data
      };
    }

    const response = await new Promise((resolve, reject) => {
      this._api.emit(events.PACKET_SENT,
        {
          command,
          data
        }
      );

      this.socket.emit(command, data, resp => {
        resolve(new Response(resp, command));
      });
    });

    if (this._api._botConfig.networking.retryOn.includes(response.code) && this._api.options.networking.retryMode === retryMode.ALWAYS_RETRY && attempt <= this._api.options.networking.retryAttempts) {
      return await this._emit(command, data, attempt + 1);
    }

    return response;
  }

  async emit (command, data) {
    return await this._emit(command, data);
  }
};
