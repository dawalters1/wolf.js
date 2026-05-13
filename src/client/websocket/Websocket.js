import _ from 'lodash';
import BaseEvent from './events/BaseEvent.js';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs/promises';
import io from 'socket.io-client';
import path, { dirname } from 'path';
import RateLimiter from '../../util/RateLimiter.js';
import WOLFResponse from '../../entities/WOLFResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CHUNK_SIZE = 50;
const MAX_EMIT_ATTEMPTS = 3;
const RETRY_CODES = new Set([408, 429, 500, 502, 504]);

const RATE_LIMITER_CONFIG = {
  SECURITY_LOGIN: { bucketSize: 5, tokensPerInterval: 5 / 60, maxQueue: 1 },
  MESSAGE_SEND: { bucketSize: 15, tokensPerInterval: 15 / 60, maxQueue: 10 },
  GENERIC: { bucketSize: 60, tokensPerInterval: 180 / 60, maxQueue: 50 },
  GROUP_MEMBER_SEARCH: { bucketSize: 10, tokensPerInterval: 10 / 60, maxQueue: 8 }
};

const createInFlightKey = (command, body) =>
  body == null
    ? command
    : `${command}:${JSON.stringify(body)}`;

const mergeResponses = (responses) =>
  responses.reduce((result, response) => {
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

export default class Websocket {
  #client;
  #handlers = new Map();
  #inFlight = new Map();
  #initialized = false;
  #rateLimiter = new RateLimiter(RATE_LIMITER_CONFIG);
  #socket = null;

  constructor (client) {
    this.#client = client;
  }

  get client () {
    return this.#client;
  }

  get socket () {
    return this.#socket;
  }

  #applyLanguageId (obj, languageId) {
    if (!languageId || typeof obj !== 'object' || obj == null) { return; }

    if (Array.isArray(obj)) {
      obj.forEach(item => { item.languageId ??= languageId; });
    } else {
      obj.languageId ??= languageId;
    }
  }

  #parseBody (body, languageId) {
    if (body == null || typeof body !== 'object') { return body; }

    const parsed = 'body' in body
      ? new WOLFResponse(body)
      : body;
    const inner = 'body' in parsed
      ? parsed.body
      : parsed;

    this.#applyLanguageId(inner, languageId);
    return parsed;
  }

  #parseAck (ack, languageId) {
    if (!ack || typeof ack !== 'object' || !ack.body) { return ack; }

    const { body } = ack;

    if (Array.isArray(body)) {
      ack.body = body.map(item => this.#parseBody(item, languageId));
      return ack;
    }

    if (typeof body !== 'object') { return ack; }

    const entries = Object.entries(body);
    const isNumericKeyed =
      entries.length > 0 && entries.every(([key]) => Number.isInteger(Number(key)));

    ack.body = isNumericKeyed
      ? new Map(entries.map(([key, value]) => [Number(key), this.#parseBody(value, languageId)]))
      : this.#parseBody(body, languageId);

    return ack;
  }

  async #loadEventHandlers () {
    const eventsDir = path.join(__dirname, './events/');
    const entries = await fs.readdir(eventsDir, { withFileTypes: true });

    await Promise.all(
      entries
        .filter(e => e.isFile() && path.parse(e.name).name.toLowerCase() !== 'baseevent')
        .map(async e => {
          const imported = await import(pathToFileURL(path.join(eventsDir, e.name)).toString());
          const EventClass = imported.default;
          if (typeof EventClass !== 'function') { return; }

          const handler = new EventClass(this.#client);
          if (handler instanceof BaseEvent) {
            this.#handlers.set(handler.eventName, handler);
          }
        })
    );
  }

  async #buildSocketUrl () {
    const { framework } = this.#client.config;
    const { host, port, query } = framework.connection;
    const { device, version } = query;
    const { state, token, apiKey } = framework.login;

    if (!apiKey) {
      this.client.log.warn('[Websocket] apiKey will be required to log in in a future release.');
    }

    const packageVersion = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../../package.json'), 'utf-8')
    ).version;

    const params = new URLSearchParams({
      token,
      device,
      state,
      version: version || packageVersion,
      ...(apiKey && { apiKey })
    });

    return `${host}:${port}/?${params}`;
  }

  #patchBackoff () {
    const backoff = this.#socket.io.backoff;
    const originalDuration = backoff.duration.bind(backoff);

    backoff.duration = () => {
      const useOverride = 'reconnectionDelayOverride' in this.#socket;
      const delay = useOverride
        ? this.#socket.reconnectionDelayOverride
        : originalDuration();
      Reflect.deleteProperty(this.#socket, 'reconnectionDelayOverride');

      if (delay === -1) { return this.#socket.disconnect(); }
      return delay;
    };
  }

  #bindSocketEvents () {
    const { socket, client } = this;

    socket.io.on('open', () => client.emit('connecting'));
    socket.on('connect', () => client.emit('connected'));
    socket.on('connect_error', error => client.emit('connectError', error));
    socket.on('connect_timeout', () => client.emit('connectTimeout'));
    socket.on('error', error => client.emit('socketError', error));
    socket.on('ping', () => client.emit('ping'));
    socket.on('pong', latency => client.emit('pong', latency));
    socket.io.on('reconnect_attempt', attempt => client.emit('reconnectAttempt', attempt));
    socket.io.on('reconnect', () => client.emit('reconnected'));
    socket.io.on('reconnect_failed', () => client.emit('reconnectFailed'));
    socket.io.on('reconnect_error', () => client.emit('reconnectFailed'));

    socket.on('disconnect', reason => {
      client.loggedIn = false;
      client.emit('disconnected', reason);
      if (reason === 'io server disconnect') { socket.connect(); }
    });

    socket.onAny((event, args) => {
      const handler = this.#handlers.get(event);
      if (handler) { handler.process(args?.body ?? args); }
    });
  }

  async _init () {
    if (this.#socket || this.#initialized) { return; }
    this.#initialized = true;

    try {
      await this.#loadEventHandlers();

      const socketUrl = await this.#buildSocketUrl();
      this.#socket = io(socketUrl, {
        transports: ['websocket'],
        reconnection: true,
        autoConnect: false
      });

      this.#patchBackoff();
      this.#bindSocketEvents();
    } catch (err) {
      this.#initialized = false;
      throw err;
    }
  }

  async connect () {
    if (!this.#socket) { await this._init(); }
    if (!this.#socket?.connected) { this.#socket?.connect(); }
  }

  async disconnect () {
    if (!this.#socket?.connected) { return; }
    this.#socket.disconnect();
    this.#socket.destroy();
    return true;
  }

  async #emitOnce (command, body, attempt = 0) {
    return new Promise((resolve, reject) => {
      this.#socket.emit(command, body, async (ack) => {
        try {
          const parsedAck = this.#parseAck(ack, body?.body?.languageId);
          const response = new WOLFResponse(parsedAck);

          if (!response.success) {
            if (!RETRY_CODES.has(response.code) || attempt >= MAX_EMIT_ATTEMPTS) {
              this.client.log.warn('[Websocket] Request failed:', command, body, '\nResponse:', response);
              return reject(response);
            }
            return resolve(await this.#emitOnce(command, body, attempt + 1));
          }

          resolve(response);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async #emit (command, body) {
    return this.#rateLimiter.schedule(command, () => this.#emitOnce(command, body));
  }

  #normalizeBody (body) {
    if (!body) { return body; }
    return body.headers || body.body
      ? body
      : { body };
  }

  #deduped (key, factory) {
    if (this.#inFlight.has(key)) { return this.#inFlight.get(key); }
    const promise = factory().finally(() => this.#inFlight.delete(key));
    this.#inFlight.set(key, promise);
    return promise;
  }

  async emit (command, body) {
    const requestBody = this.#normalizeBody(body);

    if (!requestBody?.body?.idList) {
      const key = createInFlightKey(command, requestBody);
      return this.#deduped(key, () => this.#emit(command, requestBody));
    }

    const responses = await Promise.all(
      _.chunk(requestBody.body.idList, CHUNK_SIZE).map(idChunk => {
        const chunkRequest = { ...requestBody, body: { ...requestBody.body, idList: idChunk } };
        const key = createInFlightKey(command, chunkRequest);
        return this.#deduped(key, () => this.#emit(command, chunkRequest));
      })
    );

    return mergeResponses(responses);
  }
}
