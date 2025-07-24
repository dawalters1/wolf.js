import BaseEvent from './baseEvent.js';
import MessageUpdate from '../../../entities/messageUpdate.js';

class MessageUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'message update');
  }

  async process (data) {
    this.client.emit(
      'messageUpdate',
      new MessageUpdate(this.client, data)
    );
  }
}

export default MessageUpdateEvent;
