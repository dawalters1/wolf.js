import BaseEvent from './BaseEvent.js';

export default class SubscriberFollowUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber follow update');
  }
}
