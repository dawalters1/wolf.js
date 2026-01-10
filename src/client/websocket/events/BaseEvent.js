
export default class BaseEvent {
  #client;

  constructor (client, eventName) {
    this.#client = client;
    this.eventName = eventName;
  }

  get client () {
    return this.#client;
  }

  async process (data) {
    throw new Error(`Event '${this.eventName}' Processor NOT IMPLEMENTED`);
  }
}
