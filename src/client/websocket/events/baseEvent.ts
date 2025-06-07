import WOLF from '../../WOLF.ts';

class BaseEvent<T = undefined> {
  static ArgClass?: new (client: WOLF, args: any) => any;
  client: WOLF;
  event: string;

  constructor (client: WOLF, event: string) {
    this.client = client;
    this.event = event;
  }

  async process (data?: T) {
    throw new Error(`Event '${this.event}' Processor Not Implemented`);
  }
}

export default BaseEvent;
