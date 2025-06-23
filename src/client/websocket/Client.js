import { Event, SocketEvent } from '../../constants/index.js';
import fs from 'fs';
import io from 'socket.io-client';
import path, { dirname } from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { Response, WOLFAPIError } from '../../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDirectory = filePath => fs.statSync(filePath).isDirectory();
const getDirectories = filePath =>
  fs.readdirSync(filePath)
    .map(name => path.join(filePath, name))
    .filter(isDirectory);

const isFile = filePath => fs.statSync(filePath)
  .isFile();
const getFiles = filePath =>
  fs.readdirSync(filePath)
    .map(name => path.join(filePath, name))
    .filter(isFile);

const getFilesRecursively = (path) => {
  const files = getDirectories(path)
    .map(dir => getFilesRecursively(dir)) // go through each directory
    .reduce((a, b) => a.concat(b), []); // map returns a 2d array (array of file arrays) so flatten

  return files.concat(getFiles(path));
};

const getHandlers = () => getFilesRecursively(path.join(__dirname, './events/'))
  .filter((source) =>
    !fs.lstatSync(source).isDirectory() &&
  path.parse(source).name !== 'Base'
  );

class Websocket {
  constructor (client) {
    this.client = client;
  }

  async init () {
    this.handlers = await getHandlers()
      .reduce(async (result, source) => {
        const handler = new (await import(pathToFileURL(source))).default(this.client); // eslint-disable-line new-cap

        if (!(handler instanceof (await import('./events/Base.js')).default)) {
          return result;
        }

        (await result)[handler.event] = handler;

        return result;
      }, {});

    const { host, port, query } = this.client._frameworkConfig.get('connection');
    const { device, version } = query;
    const { onlineState, token, apiKey } = this.client.config.get('framework.login');

    if(apiKey === undefined){
      console.warn(`apiKey will be required to login in the future`)
    }

    this.socket = io(`${host}:${port}/?token=${token}${apiKey===undefined?'':`&apiKey=${apiKey}`}&device=${device}&state=${onlineState}&version=${version || JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json'))).version}`,
      {
        transports: ['websocket'],
        reconnection: true,
        autoConnect: false
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

    this.socket.onAny((eventString, data) => {
      this.client.emit(Event.PACKET_RECEIVED, eventString, data);

      const handler = this.handlers[eventString];
      const body = data?.body ?? data;

      return handler === undefined
        ? this.client.emit(Event.INTERNAL_ERROR, new WOLFAPIError('Unhandled socket event', { eventString, data }))
        : handler.process(body);
    });
  }

  async connect () {
    if (!this.socket) { await this.init(); }

    if (this.socket?.connected) { return; }

    return this.socket?.connect();
  }

  async disconnect () {
    if (!this.socket?.connected) { return; }

    return this.socket?.disconnect();
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
