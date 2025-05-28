import WOLF from '../client/WOLF.ts';

abstract class Base {
  client: WOLF;

  constructor (client: WOLF) {
    this.client = client;
  }

  protected _patch? (...args: any): void {};
}

export default Base;
