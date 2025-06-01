import WOLF from '../../WOLF.ts';

class BaseEvent {
  client: WOLF;
  event: string;

  constructor (client: WOLF, event: string) {
    this.client = client;
    this.event = event;
  }

  async process (data?: any) {
    throw new Error(`Event '${this.event}' Processor Not Implemented`);
  }
}

export default BaseEvent;
