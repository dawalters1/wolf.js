const { ServerEvents, Events } = require('../../../../constants');

class Processor {
  constructor (api) {
    this._api = api;

    this._handlers = {};

    for (const group of Object.entries(ServerEvents)) {
      for (const evt of Object.entries(group[1])) {
        if (this._api._botConfig.get('networking.events.ignore').includes(evt[1])) {
          continue;
        }
        this._handlers[evt[1].toString()] = require(`./${group[0].toLowerCase()}/${evt[0]}.js`);
      }
    }
  }

  async process (eventName, body) {
    if (this._api._botConfig.get('networking.events.ignore').includes(eventName)) {
      return Promise.resolve();
    }

    this._api.emit(
      Events.PACKET_RECEIVED,
      eventName,
      body
    );

    if (!Object.keys(this._handlers).includes(eventName)) {
      return this._api.emit(
        Events.INTERNAL_ERROR,
          `Unhandled socket event: ${eventName}`
      );
    }

    return await this._handlers[eventName](this._api, body.body ? body.body : body);
  }
}

module.exports = Processor;
