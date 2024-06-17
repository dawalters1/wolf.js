import BaseEvent from './Base.js';

class SubscriberGroupEventDelete extends BaseEvent {
  constructor () {
    super('subscriber group event delete');
  }
}

export default SubscriberGroupEventDelete;
