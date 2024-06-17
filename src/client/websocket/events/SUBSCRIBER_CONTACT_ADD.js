import BaseEvent from './Base.js';

class SubscriberContactAdd extends BaseEvent {
  constructor () {
    super('subscriber contact add');
  }
}

export default SubscriberContactAdd;
