
class BaseEvent {
  constructor (client, event) {
    this.client = client;
    this.event = event;
  }

  async process (data) {
    throw new Error(`Event '${this.event}' Processor Not Implemented`);
  }
}

export default BaseEvent;
