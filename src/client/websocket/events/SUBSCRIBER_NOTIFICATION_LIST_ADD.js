import BaseEvent from './Base.js';

class SubscriberNotificationListAdd extends BaseEvent {
  constructor () {
    super('subscriber notification list add');
  }
}

export default SubscriberNotificationListAdd;
