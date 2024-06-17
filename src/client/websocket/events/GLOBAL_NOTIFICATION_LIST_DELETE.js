import BaseEvent from './Base.js';

class GlobalNotificationListDelete extends BaseEvent {
  constructor () {
    super('global notification list delete');
  }
}

export default GlobalNotificationListDelete;
