import BaseEvent from './Base.js';

class MessageSend extends BaseEvent {
  constructor () {
    super('message send');
  }
}

export default MessageSend;
