import BaseEvent from './Base.js';

class GlobalNotificationListAdd extends BaseEvent {
  constructor () {
    super('global notification list add');
  }
}

export default GlobalNotificationListAdd;
