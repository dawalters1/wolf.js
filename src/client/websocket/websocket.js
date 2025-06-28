import _ from 'lodash';
import BaseEvent from './events/baseEvent.js';
import EventRegistry from './eventRegistry.js';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import io from 'socket.io-client';
import path, { dirname } from 'path';
import WOLFResponse from '../../entities/WOLFResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Websocket {
  socket;

  constructor (client) {
    this.client = client;
    this.handlers = new EventRegistry();
  }

  async _init () {
    if (this.socket) { return; }

    const eventsDir = path.join(__dirname, './events/');
    const filePaths = fs.readdirSync(eventsDir)
      .map(name => path.join(eventsDir, name))
      .filter(filePath =>
        fs.lstatSync(filePath).isFile() &&
        path.parse(filePath).name !== 'baseEvent'
      );

    for (const filePath of filePaths) {
      const imported = await import(pathToFileURL(filePath).toString());
      const HandlerClass = imported.default;
      if (typeof HandlerClass !== 'function') { continue; }

      const handler = new HandlerClass(this.client);
      if (handler instanceof BaseEvent) { this.handlers.register(handler); }
    }

    const { framework } = this.client.config;
    const { host, port, query } = framework.connection;
    const { device, version } = query;
    const { onlineState, token, apiKey } = framework.login;

    const packageVersion = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../../package.json'), 'utf-8')
    ).version;

    if (apiKey === undefined) {
      console.warn('APIKey will be required to login in the future');
    }

    const socketUrl = `${host}:${port}/?token=${token}${apiKey === undefined ? '' : `&apiKey=${apiKey}`}&device=${device}&state=${onlineState}&version=${version || packageVersion}`;

    this.socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      autoConnect: false
    });

    this.socket.io.on('open', () => this.client.emit('connecting'));
    this.socket.on('connect', () => this.client.emit('connected'));
    this.socket.on('connect_error', error => this.client.emit('connectError', error));
    this.socket.on('connect_timeout', () => this.client.emit('connectTimeout'));
    this.socket.on('disconnect', reason => {
      this.client.loggedIn = false;
      this.client.emit('disconnected', reason);
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });
    this.socket.on('error', error => this.client.emit('socketError', error));
    this.socket.io.on('reconnect_attempt', attempt => this.client.emit('reconnectAttempt', attempt));
    this.socket.io.on('reconnect', () => this.client.emit('reconnected'));
    this.socket.io.on('reconnect_failed', () => this.client.emit('reconnectFailed'));
    this.socket.on('ping', () => this.client.emit('ping'));
    this.socket.on('pong', latency => this.client.emit('pong', latency));

    this.socket.onAny((event, args) => {
      const handler = this.handlers.get(event);
      if (!handler) { return; }
      return handler.process(args?.body ?? args);
    });
  }

  _parseBody = (body, languageId) => {
    const formattedBody = typeof body === 'object' && 'body' in body ? new WOLFResponse(body) : body;

    if (!languageId) { return formattedBody; }

    if (formattedBody instanceof WOLFResponse) {
      formattedBody.body.languageId = formattedBody.body.languageId ?? languageId;
    } else if (formattedBody && typeof formattedBody === 'object') {
      formattedBody.languageId = formattedBody.languageId ?? languageId;
    }

    return formattedBody;
  };

  _parseAck (ack, languageId) {
    if (Array.isArray(ack.body)) {
      ack.body = ack.body.map(body => this._parseBody(body, languageId));
    } else if (ack.body && typeof ack.body === 'object') {
      const entries = Object.entries(ack.body);
      const isNumericKeyed = entries.every(([key]) => !isNaN(Number(key)));

      if (isNumericKeyed) {
        ack.body = new Map(
          entries.map(([key, value]) => [Number(key), this._parseBody(value, languageId)])
        );
      } else {
        ack.body = this._parseBody(ack.body, languageId);
      }
    }

    return ack;
  }

  async emit (command, body) {
    const emitOnce = (requestBody, attempt = 0) =>
      new Promise((resolve, reject) => {
        this.socket?.emit(command, requestBody, async ack => {
          const response = new WOLFResponse(this._parseAck(ack, requestBody?.body?.languageId));

          if (!response.success) {
            const retryCodes = [408, 429, 500, 502, 504];
            if (!retryCodes.includes(response.code) || attempt >= 3) {
              if (response.code === 403) {
                console.log(command);
              }
              return reject(response);
            }

            return resolve(await emitOnce(requestBody, attempt + 1));
          }

          resolve(response);
        });
      });

    const requestBody = body && !body.headers && !body.body ? { body } : body;

    if (requestBody?.body && Reflect.has(requestBody.body, 'idList')) {
      const responses = await Promise.all(
        _.chunk(requestBody.body.idList, 50).map(idChunk =>
          emitOnce({
            ...requestBody,
            body: { ...requestBody.body, idList: idChunk }
          })
        )
      );

      return Object.assign({}, ...responses);
    }

    return emitOnce(requestBody);
  }

  async connect () {
    if (!this.socket) { await this._init(); }
    if (this.socket?.connected) { return; }
    return this.socket?.connect();
  }

  async disconnect () {
    if (!this.socket?.connected) { return; }
    return this.socket?.disconnect();
  }
}
