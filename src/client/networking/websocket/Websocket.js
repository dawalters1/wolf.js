const Handler = require('./handlers');
const Response = require('../../../models/ResponseObject');

const io = require('socket.io-client');
const { Events } = require('../../../constants');

/**
 * {@hideconstructor}
 */
module.exports = class Websocket {
  constructor (api) {
    this._api = api;
    this._handler = new Handler(this._api);

    this._requestId = 1;
    this._requests = [];
  };

  _init () {
    this.socket = io(`${this._api._botConfig.connection.host}:${this._api._botConfig.connection.port}/?token=${this._api.config._loginSettings.token}&device=${this._api.config._loginSettings.loginDevice}&state=${this._api.config._loginSettings.onlineState}`,
      {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 3000,
        reconnectionAttempts: Infinity
      }
    );

    this.socket.on('connect', () => this._api.emit(Events.CONNECTED));

    this.socket.on('connect_error', error => this._api.emit(Events.CONNECTION_ERROR, error));

    this.socket.on('connect_timeout', error => this._api.emit(Events.CONNECTION_TIMEOUT, error));

    this.socket.on('disconnect', reason => {
      this._api.emit(Events.DISCONNECTED, reason);
      // Socket doesnt reconnect on io server disconnect, manually reconnect
      if (reason === 'io server disconnect') {
        this.socket.connect();
      } else {
        this._api._cleanup(true);
      }
    });

    this.socket.on('error', error => this._api.emit(Events.ERROR, error));

    this.socket.on('reconnecting', reconnectNumber => this._api.emit(Events.RECONNECTING, reconnectNumber));

    this.socket.on('reconnect', () => this._api.emit(Events.RECONNECTED));

    this.socket.on('reconnect_failed', error => this._api.emit(Events.RECONNECT_FAILED, error));

    this.socket.on('ping', () => this._api.emit(Events.PING));
    this.socket.on('pong', (latency) => this._api.emit(Events.PONG, latency));

    const patch = require('socketio-wildcard')(io.Manager);
    patch(this.socket);

    this.socket.on('*', packet => {
      this._handler.handle(packet.data);
    });
  }

  async _emit (command, data) {
    if (data && !data.body && !data.headers) {
      data = {
        body: data
      };
    }

    const duplicateRequest = this._requests.find((request) => request.command === command && JSON.stringify(request.data) === JSON.stringify(data));

    if (duplicateRequest) {
      return await duplicateRequest.def;
    }

    const request = {
      requestId: this._requestId,
      command,
      data,
      def: undefined
    };

    this._requests.push(request);

    this._requestId += 1;

    const response = await new Promise((resolve, reject) => {
      request.def = { resolve, reject };
      this._api.emit(Events.PACKET_SENT,
        command,
        data
      );

      this.socket.emit(command, data, resp => {
        resolve(new Response(resp, command));
      });
    });

    this._requests = this._requests.filter((req) => req.id !== request.id);

    return response;
  }

  async emit (command, data) {
    return await this._emit(command, data);
  }
};
