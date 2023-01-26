import Processor from './events/Processor.js';
import RequestQueue from './RequestQueue.js';
import Response from '../../models/Response.js';
import { Event, SocketEvent, ServerEvents } from '../../constants/index.js';
import io from 'socket.io-client';

class Websocket {
  constructor(client) {
    this.client = client;
    this._processor = new Processor(this.client);

    this._messageQueue = new RequestQueue(
      this.client,
      {
        capacity: 50,
        regenerationPeriod: (15 / 60) * 1000,
        name: 'message'
      }
    );

    this._genericQueue = new RequestQueue(
      this.client,
      {
        capacity: 50,
        regenerationPeriod: (180 / 60) * 1000,
        name: 'generic'
      }
    );
  }

  _disconnect() {
    return this.socket?.disconnect();
  }

  _create() {
    const connectionSettings = this.client._frameworkConfig.get('connection');
    const { onlineState, token } = this.client.config.get('framework.login');

    this.socket = io(`${connectionSettings.host}:${connectionSettings.port}/?token=${token}&device=${connectionSettings.query.device}&state=${onlineState}`,
      {
        transports: ['websocket'],
        reconnection: true
      }
    );

    this.socket.on(SocketEvent.CONNECT, () => this.client.emit(Event.CONNECTED));
    this.socket.on(SocketEvent.CONNECT_ERROR, error => this.client.emit(Event.CONNECTION_ERROR, error));
    this.socket.on(SocketEvent.CONNECT_TIMEOUT, error => this.client.emit(Event.CONNECTION_TIMEOUT, error));
    this.socket.on(SocketEvent.DISCONNECT, reason => this.client.emit(Event.DISCONNECTED, reason));
    this.socket.on(SocketEvent.ERROR, error => this.client.emit(Event.ERROR, error));
    this.socket.io.on(SocketEvent.RECONNECT_ATTEMPT, reconnectNumber => this.client.emit(Event.RECONNECTING, reconnectNumber));
    this.socket.io.on(SocketEvent.RECONNECT, () => this.client.emit(Event.RECONNECTED));
    this.socket.io.on(SocketEvent.RECONNECT_FAILED, error => this.client.emit(Event.RECONNECT_FAILED, error));
    this.socket.on(SocketEvent.PING, () => this.client.emit(Event.PING));
    this.socket.on(SocketEvent.PONG, (latency) => this.client.emit(Event.PONG, latency));

    this.socket.onAny((eventName, data) => this._processor.process(eventName, data));
  }

  async emit(command, body) {
    const request = {
      command,
      body: body && !body.headers && !body.body ? { body } : body
    };

    if (command === ServerEvents.MESSAGE.MESSAGE_SEND) {
      return new Response(await this._messageQueue.enqueue(request));
    } else {
      return new Response(await this._genericQueue.enqueue(request));
    }
  }
}

export default Websocket;
