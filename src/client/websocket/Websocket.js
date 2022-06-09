const Processor = require('./events/Processor');
const RequestQueue = require('./RequestQueue');
const Response = require('../../models/Response');
const { Event, SocketEvent, ServerEvents } = require('../../constants');
const io = require('socket.io-client');

class Websocket {
  constructor (client) {
    this.client = client;

    this._processor = new Processor(this.client);

    this._messageQueue = new RequestQueue(this.client,
      {
        capacity: 10,
        regenerationPeriod: (15 / 60) * 1000, // Generate a new message token every 4 seconds
        name: 'message'
      }
    );

    this._genericQueue = new RequestQueue(this.client,
      {
        capacity: 50,
        regenerationPeriod: (180 / 60) * 1000, // Generate a new request token every 3 seconds
        name: 'generic'
      }
    );
  }

  _create () {
    const connectionSettings = this.client._botConfig.get('connection');
    const loginDetails = undefined;// this.client.config.get('loginDetails');

    this.socket = io(`${connectionSettings.host}:${connectionSettings.port}/?token=${loginDetails?.token ?? 'WE7ea290a4a1be9049118affa8d70b60e7'}&device=${connectionSettings.device ?? 'wjsframework'}&state=${loginDetails?.onlineState ?? '1'}`,
      {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 3000,
        reconnectionAttempts: Infinity
      }
    );

    this.socket.on(SocketEvent.CONNECT, () => this.client.emit(Event.CONNECTED));

    this.socket.on(SocketEvent.CONNECT_ERROR, error => this.client.emit(Event.CONNECTION_ERROR, error));

    this.socket.on(SocketEvent.CONNECT_TIMEOUT, error => this.client.emit(Event.CONNECTION_TIMEOUT, error));

    this.socket.on(SocketEvent.DISCONNECT, reason => this.client.emit(Event.DISCONNECTED, reason));

    this.socket.on(SocketEvent.ERROR, error => this.client.emit(Event.ERROR, error));

    this.socket.on(SocketEvent.RECONNECTING, reconnectNumber => this.client.emit(Event.RECONNECTING, reconnectNumber));

    this.socket.on(SocketEvent.RECONNECTED, () => this.client.emit(Event.RECONNECTED));

    this.socket.on(SocketEvent.RECONNECT_FAILED, error => this.client.emit(Event.RECONNECT_FAILED, error));

    this.socket.on(SocketEvent.PING, () => this.client.emit(Event.PING));
    this.socket.on(SocketEvent.PONG, (latency) => this.client.emit(Event.PONG, latency));

    this.socket.onAny((eventName, data) => this._processor.process(eventName, data));
  }

  async emit (command, body) {
    const request = {
      command,
      body: body && !body.headers && !body.body ? { body } : body
    };

    if (command === ServerEvents.MESSAGE.MESSAGE_SEND) {
      return await new Response(await this._messageQueue.enqueue(request));
    } else {
      return await new Response(await this._genericQueue.enqueue(request));
    }
  }
}

module.exports = Websocket;
