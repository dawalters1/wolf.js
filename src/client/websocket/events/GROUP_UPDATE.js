import BaseEvent from './Base.js';

class GroupUpdate extends BaseEvent {
  constructor () {
    super('group update');
  }
}

export default GroupUpdate;
