import Processor from './events/Processor.js';
import { Event, SocketEvent } from '../../constants/index.js';
import fs from 'fs';
import io from 'socket.io-client';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Response } from '../../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Websocket {
  constructor (client) {
    this.client = client;
    this._processor = new Processor(this.client);
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
    const sendRequest = async (command, body, currentAttempts = 0) => new Promise((resolve) => {
      this.socket.emit(command, body, async resp => {
        const response = new Response(resp);

        if (!response.success) {
          const { retryCodes, essential, attempts } = this.client._frameworkConfig.get('connection.requests');

          if (retryCodes.includes(response.code) && (essential.includes(command.toLowerCase()) || currentAttempts < attempts)) {
            return await sendRequest(command, body, currentAttempts++);
          }

          this.client.emit(Event.PACKET_FAILED, command, body);
        }

        resolve(response);
      });

      this.client.emit(currentAttempts ? Event.PACKET_RETRY : Event.PACKET_SENT, command, body, currentAttempts);
    });

    return await sendRequest(
      command,
      body && !body.headers && !body.body ? { body } : body
    );
  }
}

export default Websocket;
