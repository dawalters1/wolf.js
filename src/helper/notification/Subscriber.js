import Base from '../Base.js';

class Subscriber extends Base {
  constructor (client) {
    super(client);

    this.notifications = [];
  }

  _cleanUp (reconnection = false) {
    this.notifications = [];
  }
}

export default Subscriber;
