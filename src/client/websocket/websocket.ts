import _ from 'lodash';
import BaseEvent from './events/baseEvent.ts';
import EventRegistry from './eventRegistry';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import io, { Socket } from 'socket.io-client';
import path, { dirname } from 'path';
import WOLF from '../WOLF.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Websocket {
  client: WOLF;
  handlers: EventRegistry = new EventRegistry();
  socket?: Socket;

  constructor (client: WOLF) {
    this.client = client;
  }

  async _init () {
    if (this.socket) return;

    // Load event handler files dynamically (excluding baseEvent)
    const eventsDir = path.join(__dirname, './events/');
    const filePaths = fs.readdirSync(eventsDir)
      .map(name => path.join(eventsDir, name))
      .filter(filePath => fs.lstatSync(filePath).isFile() && path.parse(filePath).name !== 'baseEvent');

    for (const filePath of filePaths) {
      const imported = await import(pathToFileURL(filePath).toString());
      const HandlerClass = imported.default;
      if (typeof HandlerClass !== 'function') {
        continue;
      }

      const handler = new HandlerClass(this.client);

      if (handler instanceof BaseEvent) {
        this.handlers.register(handler);
      }
    }

    // Build socket.io URL with query params from client config
    const { framework } = this.client.config;
    const { host, port, query } = framework.connection;
    const { device, version } = query;
    const { onlineState, token } = framework.login;

    const packageVersion = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../../package.json'), 'utf-8')
    ).version;

    const socketUrl = `${host}:${port}/?token=${token}&device=${device}&state=${onlineState}&version=${version || packageVersion}`;

    this.socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      autoConnect: false
    });

    this.socket.io.on('open', () => console.log('CONNECTING'));
    this.socket.on('connect', () => console.log('CONNECTED'));
    this.socket.on('connect_error', error => console.log('CONNECT ERROR', error));
    this.socket.on('connect_timeout', error => console.log('CONNECT TIMEOUT', error));
    this.socket.on('disconnect', reason => {
      console.log('DISCONNECTED', reason);
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });
    this.socket.on('error', error => console.log('ERROR', error));
    this.socket.io.on('reconnect_attempt', attempt => console.log('RECONNECTING', attempt));
    this.socket.io.on('reconnect', () => console.log('RECONNECTED'));
    this.socket.io.on('reconnect_failed', () => console.log('RECONNECT FAILED'));
    this.socket.on('ping', () => console.log('PING'));
    this.socket.on('pong', latency => console.log('PONG', latency));

    // Handle all incoming events with their registered handlers
    this.socket.onAny((event: string, args: any) => {
      const handler = this.handlers.get(event);
      if (!handler) return;

      return handler.process(args?.body ?? args);
    });
  }

  async emit<T> (command: string, body?: any): Promise<WOLFResponse<T>> {
    const emitOnce = (requestBody?: any, attempt = 0): Promise<WOLFResponse<T>> => new Promise((resolve, reject) => {
      this.socket?.emit(command, requestBody, async (ack: any) => {
        this._addLanguageIdToAckBody(ack, requestBody);

        const response = new WOLFResponse<T>(ack);
        if (!response.success) {
          const retryCodes = [408, 429, 500, 502, 504];
          if (!retryCodes.includes(response.code) || attempt >= 3) {
            return reject(response);
          }
          return resolve(await emitOnce(requestBody, attempt + 1));
        }
        resolve(response);
      });
    });

    const requestBody = body && !body.headers && !body.body ? { body } : body;

    // Batch request support for idList chunking
    if (requestBody?.body && Reflect.has(requestBody.body, 'idList')) {
      const responses = new Map<number, WOLFResponse<T>>();
      const headers = new Map<string, any>();

      for (const idChunk of _.chunk(requestBody.body.idList, 50)) {
        const chunkRequest = {
          ...requestBody,
          body: { ...requestBody.body, idList: idChunk }
        };
        const response = await emitOnce(chunkRequest);

        if (response.body instanceof Map) {
          for (const [index, value] of response.body.entries()) {
            responses.set(index as number, value);
          }
        }

        if (response.headers) {
          for (const [key, val] of response.headers.entries()) {
            headers.set(key, val);
          }
        }
      }

      return {
        code: 207,
        body: responses,
        headers
      } as WOLFResponse<T>;
    }

    return emitOnce(requestBody);
  }

  private _addLanguageIdToAckBody (ack: any, requestBody: any) {
    if (!requestBody || !requestBody.body || !Reflect.has(requestBody.body, 'languageId')) return;

    const languageId = requestBody.body.languageId;

    if (ack.body instanceof Map) {
      for (const [key, value] of ack.body.entries()) {
        ack.body.set(key, { ...value, languageId: ack?.body.languageId ?? languageId });
      }
    } else if (Array.isArray(ack.body)) {
      ack.body = ack.body.map((item: any) => ({ ...item, languageId: ack?.body.languageId ?? languageId }));
    } else if (typeof ack.body === 'object' && ack.body !== null) {
      ack.body = { ...ack.body, languageId: ack?.body.languageId ?? languageId };
    }
  }

  async connect () {
    if (!this.socket) {
      await this._init();
    }
    if (this.socket?.connected) return;
    return this.socket?.connect();
  }

  async disconnect () {
    if (!this.socket?.connected) return;
    return this.socket?.disconnect();
  }
}
