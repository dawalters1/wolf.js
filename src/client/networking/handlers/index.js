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
    try {
      if (!Object.keys(this._handlers).includes(command)) {
        // TODO: Warn unhandled event
      }

      return await this.handlers[command](this._api,
        {
          command,
          body: body.body ? body.body : body
        });
    } catch (error) {
      // TODO: Warn of a failed event
    }
  }
}

module.exports = Handler;
