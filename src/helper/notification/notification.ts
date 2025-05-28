import WOLF from '../../client/WOLF.ts';
import Base from '../base.ts';
import NotificationGlobalHelper from './notificationGlobal.ts';
import NotificationUserHelper from './notificationUser.ts';

class NotificationHelper extends Base {
  global: Readonly<NotificationGlobalHelper>;
  user: Readonly<NotificationUserHelper>;

  constructor (client: WOLF) {
    super(client);

    this.global = new NotificationGlobalHelper(client);
    this.user = new NotificationUserHelper(client);
  }
}

export default NotificationHelper;
