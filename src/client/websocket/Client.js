// Node Dependencies
import fs from 'fs';
import path, { dirname } from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
// 3rd Party Dependencies
import io from 'socket.io-client';
import { StatusCodes } from 'http-status-codes';
// Local Dependencies
import BaseEvent from './events/Base.js';
import Response from '../../structures/Response.js';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Websocket {
  constructor (client) {
    this.client = client;
  }

  async _getHandlers () {
    return fs.readdirSync(path.join(__dirname, './events/'))
      .map(name => path.join(path.join(__dirname, './events/'), name))
      .filter((filePath) => fs.statSync(filePath).isFile() && path.parse(filePath).name !== 'Base')
      .reduce(async (result, filePath) => {
        const handler = new (await import(pathToFileURL(filePath))).default(this.client); // eslint-disable-line new-cap

        if (!(handler instanceof BaseEvent)) {
          return result;
        }

        (await result)[handler.event] = handler;

        return result;
      }, {});
  }

  async _init () {
    this.handlers = await this._getHandlers();

    const { host, port, query } = this.client._frameworkConfig.get('connection');
    const { device, version } = query;
    const { onlineState, token } = this.client.config.get('framework.login');

    this.socket = io(`${host}:${port}/?token=${token}&device=${device}&state=${onlineState}&version=${version || JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json'))).version}`,
      {
        transports: ['websocket'],
        reconnection: true,
        autoConnect: false
      }
    );

    this.socket.io.on('open', () => this.client.emit('connecting'));
    this.socket.on('connect', () => this.client.emit('connected'));
    this.socket.on('connect error', error => this.client.emit('connectError', error));
    this.socket.on('connect timeout', error => this.client.emit('connectTimeout', error));
    this.socket.on('disconnect', reason => {
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }

      this.client.emit('disconnected', reason);
    });
    this.socket.on('error', error => this.client.emit('socketError', error));
    this.socket.io.on('reconnect attempt', reconnectNumber => this.client.emit('reconnectAttempt', reconnectNumber));
    this.socket.io.on('reconnect', () => this.client.emit('reconnected'));
    this.socket.io.on('reconnect failed', error => this.client.emit('reconnectFailed', error));
    this.socket.on('ping', () => this.client.emit('ping'));
    this.socket.on('pong', (latency) => this.client.emit('pong', latency));

    this.socket.onAny((eventString, data) => this.handlers[eventString]?.process(data?.body ?? data));
  }

  async connect () {
    if (!this.socket) {
      return await this._init();
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    return this.socket.connect();
  }

  async disconnect () {
    return this.socket?.disconnect() ?? null;
  }

  async _emit (command, body, attempt = 0) {

  }

  async emit (command, payload = null) {

  }
}

export default Websocket;
