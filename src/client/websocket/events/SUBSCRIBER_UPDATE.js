import BaseEvent from './Base.js';

class SubscriberUpdate extends BaseEvent {
  constructor () {
    super('subscriber update');
  }
}

export default SubscriberUpdate;
