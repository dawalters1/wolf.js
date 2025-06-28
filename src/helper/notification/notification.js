import BaseHelper from '../baseHelper.js';
import NotificationGlobalHelper from './notificationGlobal.js';
import NotificationUserHelper from './notificationUser.js';

class NotificationHelper extends BaseHelper {
  constructor (client) {
    super(client);

    this.global = new NotificationGlobalHelper(client);
    this.user = new NotificationUserHelper(client);
  }
}

export default NotificationHelper;
