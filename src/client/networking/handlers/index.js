const { internal } = require('../../../constants');
const events = require('../../../constants/event');

class Handler {
  constructor (api) {
    this._api = api;

    this._handlers = {};

    for (const event of Object.entries(events)) {
      this.handlers[event[1]] = require(`./${event[0]}.js`);
    }
  }

  async handle (packet) {
    const command = packet[0];
    const body = packet[1];

    if (this._api._botConfig.networking.events.ignore.includes(command)) {
      return Promise.resolve();
    }

    this._api.emit(
      internal.PACKET_RECEIVED,
      {
        command,
        body
      }
    );

    if (!Object.keys(this._handlers).includes(command)) {
      return this._api.emit(
        internal.INTERNAL_ERROR,
          `Unhandled socket event: ${command}`
      );
    }

    return await this.handlers[command](this._api,
      {
        command,
        body: body.body ? body.body : body
      });
  }
}

module.exports = Handler;
