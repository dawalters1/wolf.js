import BaseEvent from './BaseEvent.js';

export default class SubscriberFollowAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber follow add');
  }
}
