
import _ from 'lodash';
import BaseEvent from './events/baseEvent.ts';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
// import { HttpStatusCode } from 'axios';
import io, { Socket } from 'socket.io-client';
import path, { dirname } from 'path';
import WOLF from '../WOLF.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Websocket {
  client: WOLF;

  handlers: Map<string, BaseEvent>;
  socket?: Socket;

  constructor (client: WOLF) {
    this.client = client;
    this.handlers = new Map();
  }

  async _initHandlers () {
    if ([...this.handlers.keys()].length) { return; }

    const filePaths = fs.readdirSync(path.join(__dirname, './events/'))
      .map(name => path.join(__dirname, './events/', name))
      .filter(filePath => fs.lstatSync(filePath).isFile() && path.parse(filePath).name !== 'Base');

    for (const filePath of filePaths) {
      const imported = await import(pathToFileURL(filePath).toString());
      const HandlerClass = imported.default;
      const handler = new HandlerClass(this.client);

      if (handler instanceof BaseEvent) {
        this.handlers.set(handler.event, handler);
      }
    }
  }

  async _init () {
    if (this.socket) { return; }

    const { host, port, query } = this.client.config.get('framework.connection');
    const { device, version } = query;
    const { onlineState, token } = this.client.config.get('framework.login');

    this.socket = io(`${host}:${port}/?token=${token}&device=${device}&state=${onlineState}&version=${version || JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../../package.json'), 'utf-8')
    ).version}`,
    {
      transports: ['websocket'],
      reconnection: true,
      autoConnect: false
    }
    );

    this.socket.onAny((event, args) => {
      const handler = this.handlers.get(event);

      if (!handler) { return; }

      return handler.process(args);
    });
  }

  // TODO: rewrite this nightmare
  async emit<T> (command: string, body?: any) : Promise<WOLFResponse<T>> {
    const emit = async (requestBody?: any, attempt = 0): Promise<WOLFResponse<T>> => new Promise((resolve, reject) => {
      this.socket?.emit(
        command,
        requestBody,
        async (ack: any) => {
          // For internal usage
          if (requestBody && Reflect.has(requestBody.body, 'languageId')) {
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

          const response = new WOLFResponse<T>(ack);

          if (!response.success) {
            // if retry code
            const retryCodes = [408, 429, 500, 502, 504];

            if (!retryCodes.includes(response.code) || attempt >= 3) {
              return reject(response);
            }

            return await emit(attempt += 1);
          }

          return resolve(response);
        }
      );
    });

    const requestBody = body && !body.headers && !body.body ? { body } : body;

    // Batch request
    if (Reflect.has(requestBody.body, 'idList')) {
      const responses = new Map<number, WOLFResponse<T>>();
      const headers = new Map<unknown, string>();

      let index = 0;
      for (const idList of _.chunk(requestBody.idList, 50)) {
        const response = await emit(
          {
            ...requestBody,
            body: {
              ...requestBody.body,
              idList
            }
          }
        );

        (response.body as Map<number, WOLFResponse<T>>)
          .entries()
          .forEach((value) => {
            responses.set(index, value[1]);
            index++;
          });

        response.headers?.entries()?.forEach((value) => headers.set(value[0], value[1]));
      }

      return new WOLFResponse({ code: 207, body: responses, headers: headers.size ? headers : undefined });
    }

    return await emit(requestBody);
  }

  async connect () {

  }

  async disconnect () {

  }
}
