const Handler = require('./handlers');
const Response = require('../../../models/ResponseObject');

const io = require('socket.io-client');
const { Events } = require('../../../constants');

const crypto = require('crypto');

const { version } = require('../../../../package.json');

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

    const apiKey = loginSettings.apiKey;

    if (apiKey === undefined) {
      console.warn('APIKey will be required to login in the future');
    }

    this.socket = io(`${connectionSettings.host}:${connectionSettings.port}/?token=${loginSettings.token}${apiKey === undefined ? '' : `&apiKey=${apiKey}`}&device=${connectionSettings.query.device}&state=${loginSettings.onlineState}&version=${connectionSettings?.query?.version || version}`,
      {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 3000,
        reconnectionAttempts: Infinity
      }
    );

    this.socket.io.on('open', () => this._api.emit(Events.CONNECTING));

    this.socket.on('connect', () => this._api.emit(Events.CONNECTED));

    this.socket.on('connect_error', error => this._api.emit(Events.CONNECTION_ERROR, error));

    this.socket.on('connect_timeout', error => this._api.emit(Events.CONNECTION_TIMEOUT, error));

    this.socket.on('disconnect', reason => {
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }

      this._api.emit(Events.DISCONNECTED, reason);
    });

    this.socket.on('error', error => this._api.emit(Events.ERROR, error));

    this.socket.io.on('reconnecting', reconnectNumber => this._api.emit(Events.RECONNECTING, reconnectNumber));

    this.socket.io.on('reconnected', () => this._api.emit(Events.RECONNECTED));

    this.socket.io.on('reconnect_failed', error => this._api.emit(Events.RECONNECT_FAILED, error));

    this.socket.on('ping', () => this._api.emit(Events.PING));
    this.socket.on('pong', (latency) => this._api.emit(Events.PONG, latency));

    this.socket.onAny((eventName, data) => this._handler.process(eventName, data));
  }

  async _send (command, data, attempt = 0) {
    const response = await new Promise((resolve) => {
      this.socket.emit(command, data, resp =>
        resolve(resp));
    });

    if (this._api._botConfig.get('networking.retryOn').includes(response.code)) {
      if (attempt < 2) {
        this._api.emit(Events.PACKET_RETRY,
          command,
          data,
          attempt
        );

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

    const response = new Response(await this._send(command, data), command);

    this._api.emit(
      response.success || this._api._botConfig.get('networking.ignoreFailed').includes(response.code) ? Events.PACKET_SENT : Events.PACKET_FAILED,
      command,
      data,
      response
    );

    request.def.resolve(response);

    Reflect.deleteProperty(this._requestDefs, md5Key);

    return response;
  }

  async emit (command, data) {
    return await this._emit(command, data);
  }
};
