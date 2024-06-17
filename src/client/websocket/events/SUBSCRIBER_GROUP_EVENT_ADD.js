import BaseEvent from './Base.js';

class SubscriberGroupEventAdd extends BaseEvent {
  constructor () {
    super('subscriber group event add');
  }
}

export default SubscriberGroupEventAdd;
