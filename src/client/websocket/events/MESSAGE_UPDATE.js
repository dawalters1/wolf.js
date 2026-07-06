import BaseEvent from './BaseEvent.js';
import MessageUpdate from '../../../entities/MessageUpdate.js';

export default class MessageUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'message update');
  }

  async process (data) {
    this.client.log.debug(`[MessageUpdate]: Message was updated [messageUpdate:${JSON.stringify(data)}]`);

    return this.client.emit(
      'messageUpdated',
      new MessageUpdate(this.client, data)
    );
  }
}
