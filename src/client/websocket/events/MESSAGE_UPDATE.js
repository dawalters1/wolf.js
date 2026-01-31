import BaseEvent from './BaseEvent.js';
import MessageUpdate from '../../../entities/MessageUpdate.js';

export default class MessageUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'message update');
  }

  async process (data) {
    return this.client.emit(
      'messageUpdate',
      new MessageUpdate(this.client, data)
    );
  }
}
