
class BaseEvent {
  #client;
  constructor (client, event) {
    this.#client = client;
    this.event = event;
  }

  get client () {
    return this.#client;
  }

  async process (data) {
    throw new Error(`Event '${this.event}' Processor Not Implemented`);
  }
}

export default BaseEvent;
