import EventCache from '../../cache/EventCache.js';
import Base from '../Base.js';
import Channel from './Channel.js';
import Subscription from './Subscription.js';

class Event extends Base {
  constructor (client) {
    super(client);

    this.eventCache = new EventCache();

    this.channel = new Channel(client);
    this.subscription = new Subscription(client);
  }

  async getById () {

  }

  async getByIds () {

  }
}

export default Event;
