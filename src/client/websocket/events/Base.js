
class BaseEvent {
  constructor (eventString) {
    this.eventString = eventString;
  }

  async process (client, body) {
    throw new Error(`[EventHandler]: ${this.eventString} NOTIMPLEMENTED`);
  }
}

export default BaseEvent;
