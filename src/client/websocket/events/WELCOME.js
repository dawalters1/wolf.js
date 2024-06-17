import BaseEvent from './Base.js';

class Welcome extends BaseEvent {
  constructor () {
    super('welcome');
  }
}

export default Welcome;
