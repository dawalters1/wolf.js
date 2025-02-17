
class Base {
  constructor (client, event) {
    this.client = client;
    this.event = event;
  }

  async process () {
    throw new Error(`Event '${this.event}' Processor Not Implemented`);
  }
}

export default Base;
