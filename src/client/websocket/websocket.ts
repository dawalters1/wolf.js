
import WOLF from '../WOLF.ts';
import fs from 'fs';
import path, { dirname } from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import Base from './events/base.ts';
import io, { Socket } from 'socket.io-client';
import WOLFResponse from '../../structures/WOLFResponse.ts';
import { HttpStatusCode } from 'axios';

/*
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
*/
export class Websocket {
  // client: WOLF;
  /*
  handlers: Map<string, Base>;
  socket: Socket;

  constructor (client: WOLF) {
    this.client = client;
  }

  async _initHandlers () {
    if ([...this.handlers.keys()].length) { return; }

    const filePaths = fs.readdirSync(path.join(__dirname, './events/'))
      .map(name => path.join(__dirname, './events/', name))
      .filter(filePath => fs.statSync(filePath).isFile() && path.parse(filePath).name !== 'Base');

    for (const filePath of filePaths) {
      const imported = await import(pathToFileURL(filePath).toString());
      const HandlerClass = imported.default;
      const handler = new HandlerClass(this.client);

      if (handler instanceof Base) {
        this.handlers.set(handler.event, handler);
      }
    }
  }

  async _init () {
    if (this.socket) { return; }

    const { host, port, query } = this.client.config.get('framework.connection');
    const { device, version } = query;
    const { onlineState, token } = this.client.config.get('framework.login');

    this.socket = io(`${host}:${port}/?token=${token}&device=${device}&state=${onlineState}&version=${version || JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json'))).version}`,
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
*/

  async emit<T> (command: string, body?: any) : Promise<WOLFResponse<T>> {
    return new WOLFResponse<T>({ code: HttpStatusCode.NotImplemented });
  }

  async connect () {

  }

  async disconnect () {

  }
}
