import BaseEvent from './BaseEvent.js';

export default class GroupAudioSlotUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group audio slot update');
  }
}
