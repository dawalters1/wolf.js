import Base from './Base.js';

class SubscriberGroupEventAdd extends Base {
  constructor (client) {
    super(client, 'subscriber group event add');
  }

  async process (body) {

  }
}

export default SubscriberGroupEventAdd;
