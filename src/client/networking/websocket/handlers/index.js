const { ServerEvents, Events } = require('../../../../constants');

class Handler {
  constructor (api) {
    this._api = api;

    this._handlers = {};

    for (const evt of Object.entries(ServerEvents)) {
      if (this._api._botConfig.networking.events.ignore.includes(evt[1])) {
        continue;
      }
      this._handlers[evt[1].toString()] = require(`./${evt[0]}.js`);
    }
  }

  async handle (packet) {
    const command = packet[0];
    const body = packet[1];

    if (this._api._botConfig.networking.events.ignore.includes(command)) {
      return Promise.resolve();
    }

    this._api.emit(
      Events.PACKET_RECEIVED,
      command,
      body
    );

    if (!Object.keys(this._handlers).includes(command)) {
      return this._api.emit(
        Events.INTERNAL_ERROR,
          `Unhandled socket event: ${command}`
      );
    }

    return await this._handlers[command](this._api, body.body ? body.body : body);
  }
}

module.exports = Handler;
