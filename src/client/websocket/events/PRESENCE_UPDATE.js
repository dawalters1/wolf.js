import BaseEvent from './BaseEvent.js';

export default class PresenceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'presence update');
  }
}
