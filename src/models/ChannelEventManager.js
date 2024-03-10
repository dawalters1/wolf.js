import Base from './Base.js';

class ChannelEventManager extends Base {
  constructor (client) {
    super(client);

    this.list = [];
    this.complete = false;
  }
}

export default ChannelEventManager;
