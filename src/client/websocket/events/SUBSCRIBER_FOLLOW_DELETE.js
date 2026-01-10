import BaseEvent from './BaseEvent.js';

export default class SubscriberFollowDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber follow delete');
  }
}
