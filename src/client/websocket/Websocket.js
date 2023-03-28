import Processor from './events/Processor.js';
import RequestQueue from './RequestQueue.js';
import { Event, SocketEvent, ServerEvents } from '../../constants/index.js';
import fs from 'fs';
import io from 'socket.io-client';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Websocket {
  constructor (client) {
    this.client = client;
    this._processor = new Processor(this.client);

    this._messageQueue = new RequestQueue(
      this.client,
      {
        size: 15,
        interval: (15 / 60) * 1000,
        name: 'Message'
      }
    );

    this._genericQueue = new RequestQueue(
      this.client,
      {
        size: 50,
        interval: (180 / 60) * 1000,
        name: 'Generic'
      }
    );
  }

  _disconnect () {
    return this.socket?.disconnect();
  }

  _create () {
    const { host, port, query } = this.client._frameworkConfig.get('connection');
    const { device, version } = query;
    const { onlineState, token } = this.client.config.get('framework.login');

    this.socket = io(`${host}:${port}/?token=${token}&device=${device}&state=${onlineState}&version=${version || JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json'))).version}`,
      {
        transports: ['websocket'],
        reconnection: true
      }
    );

    this.socket.io.on('open', () => this.client.emit(Event.CONNECTING));
    this.socket.on(SocketEvent.CONNECT, () => this.client.emit(Event.CONNECTED));
    this.socket.on(SocketEvent.CONNECT_ERROR, error => this.client.emit(Event.CONNECTION_ERROR, error));
    this.socket.on(SocketEvent.CONNECT_TIMEOUT, error => this.client.emit(Event.CONNECTION_TIMEOUT, error));
    this.socket.on(SocketEvent.DISCONNECT, reason => {
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }

      this.client.emit(Event.DISCONNECTED, reason);
    });
    this.socket.on(SocketEvent.ERROR, error => this.client.emit(Event.ERROR, error));
    this.socket.io.on(SocketEvent.RECONNECT_ATTEMPT, reconnectNumber => this.client.emit(Event.RECONNECTING, reconnectNumber));
    this.socket.io.on(SocketEvent.RECONNECT, () => this.client.emit(Event.RECONNECTED));
    this.socket.io.on(SocketEvent.RECONNECT_FAILED, error => this.client.emit(Event.RECONNECT_FAILED, error));
    this.socket.on(SocketEvent.PING, () => this.client.emit(Event.PING));
    this.socket.on(SocketEvent.PONG, (latency) => this.client.emit(Event.PONG, latency));

    this.socket.onAny((eventName, data) => this._processor.process(eventName, data));
  }

  async emit (command, body) {
    const request = {
      command,
      body: body && !body.headers && !body.body ? { body } : body
    };

    return await this[`_${command === ServerEvents.MESSAGE.MESSAGE_SEND ? 'message' : 'generic'}Queue`].enqueue(request);
  }
}

export default Websocket;
