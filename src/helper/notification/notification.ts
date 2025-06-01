import BaseHelper from '../baseHelper.ts';
import Notification from '../../structures/notification.ts';
import NotificationGlobalHelper from './notificationGlobal.ts';
import NotificationUserHelper from './notificationUser.ts';
import WOLF from '../../client/WOLF.ts';

class NotificationHelper extends BaseHelper<Notification> {
  global: Readonly<NotificationGlobalHelper>;
  user: Readonly<NotificationUserHelper>;

  constructor (client: WOLF) {
    super(client);

    this.global = new NotificationGlobalHelper(client);
    this.user = new NotificationUserHelper(client);
  }
}

export default NotificationHelper;
