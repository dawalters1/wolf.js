import BaseEvent from './Base.js';

class SubscriberNotificationListClear extends BaseEvent {
  constructor () {
    super('subscriber notification list clear');
  }
}

export default SubscriberNotificationListClear;
