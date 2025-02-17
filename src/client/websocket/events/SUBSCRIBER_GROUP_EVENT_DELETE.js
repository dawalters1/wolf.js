import Base from './Base.js';

class SubscriberGroupEventDelete extends Base {
  constructor (client) {
    super(client, 'subscriber group event delete');
  }

  async process (body) {

  }
}

export default SubscriberGroupEventDelete;
