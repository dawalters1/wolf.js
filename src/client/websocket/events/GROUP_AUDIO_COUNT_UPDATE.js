import BaseEvent from './Base.js';

class GroupAudioCountUpdate extends BaseEvent {
  constructor () {
    super('group audio count update');
  }
}

export default GroupAudioCountUpdate;
