import BaseEvent from './BaseEvent.js';

export default class Welcome extends BaseEvent {
  constructor (client) {
    super(client, 'welcome');
  }
}
