const Handler = require('./handlers');
const Response = require('../../../models/ResponseObject');

const io = require('socket.io-client');
const { Events } = require('../../../constants');

const crypto = require('crypto');

/**
 * {@hideconstructor}
 */
module.exports = class Websocket {
  constructor (api) {
    this._api = api;
    this._handler = new Handler(this._api);

    this._requestDefs = {};
  };

  _createMD5Key (command, data) {
    return crypto.createHash('md5').update(data ? `${command}${JSON.stringify(data)}` : command).digest('hex');
  }

  _init () {
    const connectionSettings = this._api._botConfig.get('connection');
    const loginSettings = this._api.config.get('_loginSettings');
    this.socket = io(`${connectionSettings.host}:${connectionSettings.port}/?token=${loginSettings.token}&device=wolfjsframework&state=${loginSettings.onlineState}`,
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

  async _send (command, data, attempt = 0) {
    const response = await new Promise((resolve, reject) => {
      this.socket.emit(command, data, resp =>
        resolve(resp));
    });

    if (this._api._botConfig.get('networking.retryOn').includes(response.code)) {
      if (attempt < 2) {
        return await this._send(command, data, attempt + 1);
      }
    }

    return response;
  }

  async _emit (command, data) {
    if (data && !data.body && !data.headers) {
      data = {
        body: data
      };
    }

    const md5Key = this._createMD5Key(command, data);

    const duplicateRequest = this._requestDefs[md5Key];

    if (duplicateRequest) {
      return await duplicateRequest.promise;
    }

    const request = {
      def: undefined,
      promise: undefined
    };

    this._requestDefs[md5Key] = request;

    request.promise = new Promise((resolve, reject) => {
      request.def = { resolve, reject };
    });

    this._api.emit(Events.PACKET_SENT,
      command,
      data
    );

    const response = new Response(await this._send(command, data));

    request.def.resolve(response);

    Reflect.deleteProperty(this._requestDefs, md5Key);

    return response;
  }

  async emit (command, data) {
    return await this._emit(command, data);
  }
};
