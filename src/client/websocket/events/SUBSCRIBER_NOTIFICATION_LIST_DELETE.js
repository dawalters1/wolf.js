import BaseEvent from './Base.js';

class SubscriberNotificationListDelete extends BaseEvent {
  constructor () {
    super('subscriber notification list delete');
  }
}

export default SubscriberNotificationListDelete;
