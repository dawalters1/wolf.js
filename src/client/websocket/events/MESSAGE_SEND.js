import Base from './Base.js';

class MessageSend extends Base {
  constructor (client) {
    super(client, 'message send');
  }

  async process (body) {

  }
}

export default MessageSend;
