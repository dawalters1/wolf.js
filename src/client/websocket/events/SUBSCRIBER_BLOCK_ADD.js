import BaseEvent from './Base.js';

class SubscriberBlockAdd extends BaseEvent {
  constructor () {
    super('subscriber block add');
  }
}

export default SubscriberBlockAdd;
