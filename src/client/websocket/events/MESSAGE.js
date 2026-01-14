import BaseEvent from './BaseEvent.js';

export default class MessageEvent extends BaseEvent {
  constructor (client) {
    super(client, 'message');
  }
}
