import BaseEvent from './Base.js';

class SubscriberContactDelete extends BaseEvent {
  constructor () {
    super('subscriber contact delete');
  }
}

export default SubscriberContactDelete;
