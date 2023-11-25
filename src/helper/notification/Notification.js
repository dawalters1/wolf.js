import Base from '../Base.js';
import patch from '../../utils/patch.js';
import Subscriber from './Subscriber.js';
import Global from './Global.js';

class Notification extends Base {
  constructor (client) {
    super(client);

    this.subscriber = new Subscriber(client);
    this.global = new Global(client);
  }

  _process (value) {
    const existing = this.notifications.find((notification) => notification.id === value);

    existing ? patch(existing, value) : this.notifications.push(value);

    return value;
  }

  _cleanUp (reconnection = false) {
    this.notifications = [];
    this.subscriber._cleanUp(reconnection);
    this.global._cleanUp(reconnection);
  }
}

export default Notification;
