import Base from './Base.js';

class MessageUpdate extends Base {
  constructor (client) {
    super(client, 'message update');
  }

  async process (body) {

  }
}

export default MessageUpdate;
