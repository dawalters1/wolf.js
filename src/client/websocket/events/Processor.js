
class Processor {
  constructor (client) {
    this.client = client;

    // TODO: load handlers
  }

  async process (eventString, data) {
    // TODO: emit server event received
    const handler = this._handlers[eventString];
    const body = data?.body ?? data;

    if (handler) {
      return handler(this.client, body);
    }

    // TODO: emit unhandled server event
  }
}

module.exports = Processor;
