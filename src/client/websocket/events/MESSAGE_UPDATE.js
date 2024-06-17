import BaseEvent from './Base.js';

class MessageUpdate extends BaseEvent {
  constructor () {
    super('message update');
  }
}

export default MessageUpdate;
