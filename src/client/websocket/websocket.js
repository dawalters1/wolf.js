import _ from 'lodash';
import BaseEvent from './events/BaseEvent.js';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs/promises';
import io from 'socket.io-client';
import path, { dirname } from 'path';
import WOLFResponse from '../../entities/WOLFResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createInFlightKey = (command, body) =>
  body == null
    ? command
    : `${command}:${JSON.stringify(body)}`;

export default class Websocket {
  #client;
  #handlers = new Map();
  #socket = null;
  #inFlight = new Map();

  constructor (client) {
    this.#client = client;
  }

  #parseBody (body, languageId) {
    if (body == null || typeof body !== 'object') {
      return body;
    }

    const formattedBody = 'body' in body
      ? new WOLFResponse(body)
      : body;

    if (!languageId) { return formattedBody; }

    if ('body' in formattedBody) {
      if (Array.isArray(formattedBody.body)) {
        formattedBody.body.forEach((body) => { body.languageId ??= languageId; });
      } else {
        formattedBody.body.languageId ??= languageId;
      }
    } else {
      formattedBody.languageId ??= languageId;
    }

    return formattedBody;
  }

  #parseAck (ack, languageId) {
    if (!ack || typeof ack !== 'object' || !ack.body) {
      return ack;
    }

    const { body } = ack;

    if (Array.isArray(body)) {
      ack.body = body.map((body) => this.#parseBody(body, languageId));
      return ack;
    }

    if (typeof body !== 'object') { return ack; }

    const entries = Object.entries(body);
    const isNumericKeyed = entries.length > 0 && entries.every(([key]) => Number.isInteger(Number(key)));

    ack.body = isNumericKeyed
      ? new Map(
        entries.map(([key, value]) => [
          Number(key),
          this.#parseBody(value, languageId)
        ])
      )
      : this.#parseBody(body, languageId);

    return ack;
  }

  async _init () {
    if (this.#socket) { return; }

    const eventsDir = path.join(__dirname, './events/');
    const entries = await fs.readdir(eventsDir, { withFileTypes: true });

    const filePaths = entries
      .filter(e => e.isFile() && path.parse(e.name).name !== 'baseEvent')
      .map(e => path.join(eventsDir, e.name));

    await Promise.all(filePaths.map(async (filePath) => {
      const imported = await import(pathToFileURL(filePath).toString());
      const EventClass = imported.default;

      if (typeof EventClass !== 'function') { return; }

      const handler = new EventClass(this.#client);

      if (handler instanceof BaseEvent) {
        this.#handlers.set(handler.eventName, handler);
      }
    }));

    const { framework } = this.#client.config;
    const { host, port, query } = framework.connection;
    const { device, version } = query;
    const { state, token, apiKey } = framework.login;

    const packageVersion = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../../package.json'), 'utf-8')
    ).version;

    if (!apiKey) {
      console.warn('APIKey will be required to login in the future');
    }

    const socketUrl = `${host}:${port}/?token=${token}${apiKey
      ? `&apiKey=${apiKey}`
      : ''}&device=${device}&state=${state}&version=${version || packageVersion}`;

    this.#socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      autoConnect: false
    });

    const originalDuration = this.#socket.io.backoff.duration.bind(this.#socket.io.backoff);

    this.#socket.io.backoff.duration = () => {
      const useOverride = 'reconnectionDelayOverride' in this.#socket;

      const delay = useOverride
        ? this.#socket.reconnectionDelayOverride
        : originalDuration();

      Reflect.deleteProperty(this.#socket, 'reconnectionDelayOverride');

      if (delay === -1) {
        return this.#socket.disconnect();
      }

      return delay;
    };

    this.#socket.io.on('open', () => this.#client.emit('connecting'));
    this.#socket.on('connect', () => this.#client.emit('connected'));
    this.#socket.on('connect_error', error => this.#client.emit('connectError', error));
    this.#socket.on('connect_timeout', () => this.#client.emit('connectTimeout'));
    this.#socket.on('disconnect', reason => {
      this.#client.loggedIn = false;
      this.#client.emit('disconnected', reason);
      if (reason === 'io server disconnect') {
        this.#socket?.connect();
      }
    });
    this.#socket.on('error', error => this.#client.emit('socketError', error));
    this.#socket.io.on('reconnect_attempt', attempt => this.#client.emit('reconnectAttempt', attempt));
    this.#socket.io.on('reconnect', () => this.#client.emit('reconnected'));
    this.#socket.io.on('reconnect_failed', () => this.#client.emit('reconnectFailed'));
    this.#socket.io.on('reconnect_error', () => this.#client.emit('reconnectFailed'));
    this.#socket.on('ping', () => this.#client.emit('ping'));
    this.#socket.on('pong', latency => this.#client.emit('pong', latency));

    this.#socket.onAny((event, args) => {
      const handler = this.#handlers.get(event);
      if (!handler) { return; }
      return handler.process(args?.body ?? args);
    });
  }

  async connect () {
    if (!this.#socket) { await this._init(); }
    if (this.#socket?.connected) { return; }

    return this.#socket?.connect();
  }

  async disconnect () {
    if (!this.#socket?.connected) { return; }
    return this.#socket?.disconnect();
  }

  async #emit (command, body) {
    const retryCodes = new Set([408, 429, 500, 502, 504]);
    const maxAttempts = 3;

    const emitOnce = (attempt = 0) =>
      new Promise((resolve, reject) => {
        this.#socket.emit(command, body, async (ack) => {
          try {
            const parsedAck = this.#parseAck(ack, body?.body?.languageId);
            const response = new WOLFResponse(parsedAck);

            if (!response.success) {
              if (!retryCodes.has(response.code) || attempt >= maxAttempts) {
                console.log('[RequestFailed]', command, body, '\nResponse', response);
                return reject(response);
              }
              return resolve(await emitOnce(attempt + 1));
            }

            resolve(response);
          } catch (err) {
            reject(err);
          }
        });
      });

    return emitOnce();
  }

  async emit (command, body) {
    const requestBody = body && !body.headers && !body.body
      ? { body }
      : body;

    // If no idList, dedupe normally
    if (!requestBody?.body?.idList) {
      const key = createInFlightKey(command, requestBody);
      if (this.#inFlight.has(key)) { return this.#inFlight.get(key); }

      const promise = this.#emit(command, requestBody).finally(() => this.#inFlight.delete(key));
      this.#inFlight.set(key, promise);
      return promise;
    }

    const chunks = _.chunk(requestBody.body.idList, 50);

    const chunkPromises = chunks.map((idChunk) => {
      const chunkRequest = { ...requestBody, body: { ...requestBody.body, idList: idChunk } };
      const chunkKey = createInFlightKey(command, chunkRequest);

      if (this.#inFlight.has(chunkKey)) { return this.#inFlight.get(chunkKey); }

      const promise = this.#emit(command, chunkRequest).finally(() => this.#inFlight.delete(chunkKey));
      this.#inFlight.set(chunkKey, promise);
      return promise;
    });

    const responses = await Promise.all(chunkPromises);

    return responses.reduce((result, response) => {
      const resBody = response.body;
      const resultBody = result.body;

      if (Array.isArray(resBody)) {
        result.body = (Array.isArray(resultBody)
          ? resultBody
          : []).concat(resBody);
      } else if (resBody instanceof Map) {
        if (!(resultBody instanceof Map)) { result.body = new Map(); }
        for (const [key, value] of resBody) { result.body.set(key, value); }
      }

      return result;
    }, new WOLFResponse({ code: 207, body: [] }));
  }
}
