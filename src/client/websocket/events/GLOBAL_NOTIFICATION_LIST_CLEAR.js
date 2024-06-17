import BaseEvent from './Base.js';

class GlobalNotificationListClear extends BaseEvent {
  constructor () {
    super('global notification list clear');
  }
}

export default GlobalNotificationListClear;
