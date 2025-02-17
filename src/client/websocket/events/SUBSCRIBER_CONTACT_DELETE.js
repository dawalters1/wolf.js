import Base from './Base.js';

class SubscriberContactDelete extends Base {
  constructor (client) {
    super(client, 'subscriber contact update');
  }

  async process (body) {

  }
}

export default SubscriberContactDelete;
